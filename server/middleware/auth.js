import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const auth = req.auth();        // ✅ CALL IT
    const userId = auth.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  } catch (error) {
    console.error("Admin Auth Error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};
