import mongoose from "mongoose";
import dotenv from "dotenv";
import Show from "./models/Show.js";
import { reserveSeatsAtomic, rollbackReservedSeats } from "./controllers/bookingController.js";

dotenv.config({ path: "./.env" });

const runConcurrencyTest = async () => {
  console.log("==================================================");
  console.log("🚀 STARTING ATOMIC CONCURRENCY BOOKING TEST");
  console.log("==================================================");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB.");

    // 1. Create a dummy test show document
    const testShow = await Show.create({
      movie: "test_movie_id",
      showDateTime: new Date(),
      showPrice: "250",
      occupiedSeats: {}
    });

    console.log(`📌 Created temporary test show with ID: ${testShow._id}`);

    const targetSeat = "A1";
    const concurrentUsers = ["user_alpha", "user_beta", "user_gamma", "user_delta", "user_epsilon"];

    console.log(`\n⚡ Simulating ${concurrentUsers.length} users concurrently attempting to book seat '${targetSeat}' at the EXACT same time...`);

    // 2. Launch 5 simultaneous parallel promises targeting the exact same seat
    const results = await Promise.all(
      concurrentUsers.map(async (userId) => {
        const result = await reserveSeatsAtomic(testShow._id.toString(), [targetSeat], userId);
        return { userId, success: result !== null };
      })
    );

    console.log("\n📊 CONCURRENCY TEST RESULTS:");
    let successCount = 0;
    let conflictCount = 0;

    results.forEach((res) => {
      if (res.success) {
        successCount++;
        console.log(`  ✅ User '${res.userId}': SUCCESS (Seat ${targetSeat} reserved)`);
      } else {
        conflictCount++;
        console.log(`  ❌ User '${res.userId}': REJECTED (409 Conflict - Seat already reserved)`);
      }
    });

    console.log("\n--------------------------------------------------");
    console.log(`Successful Reservations: ${successCount} (Expected: 1)`);
    console.log(`Rejected Conflicts:     ${conflictCount} (Expected: ${concurrentUsers.length - 1})`);
    console.log("--------------------------------------------------");

    if (successCount === 1 && conflictCount === concurrentUsers.length - 1) {
      console.log("🎉 VERIFICATION PASSED: MongoDB findOneAndUpdate prevents race conditions 100%!");
    } else {
      console.error("❌ VERIFICATION FAILED: Double booking detected!");
    }

    // Clean up test show
    await Show.findByIdAndDelete(testShow._id);
    console.log(`\n🧹 Cleaned up temporary test show.`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("Test error:", error);
    process.exit(1);
  }
};

runConcurrencyTest();
