import React, { useState } from "react";
import BlurCircle from "./BlurCircle";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DateSelect = ({ dateTime, id }) => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const onBookHandler = () => {
    if (!selected) {
      toast.error("Please select a date");
      return;
    }

    navigate(`/movies/${id}/${selected}`);
    window.scrollTo(0, 0);
  };

  return (
    <div id="dateSelect" className="pt-24">
  <div className="relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
    
    <BlurCircle top="-100px" left="-100px" />
    <BlurCircle top="100px" right="0px" />

    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
      
      {/* LEFT SIDE – DATE SELECTION */}
      <div>
        <p className="text-lg font-semibold">Choose Date</p>

        <div className="flex items-center gap-6 text-sm mt-5">
          <ChevronLeftIcon width={28} />

          <span className="grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4">
            {Object.keys(dateTime).map((date) => (
              <button
                key={date}
                onClick={() => setSelected(date)}
                className={`flex flex-col items-center justify-center h-14 w-14 rounded transition
                  ${
                    selected === date
                      ? "bg-primary text-white"
                      : "border border-primary/70 hover:bg-primary/20"
                  }`}
              >
                <span>{new Date(date).getDate()}</span>
                <span>
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
              </button>
            ))}
          </span>

          <ChevronRightIcon width={28} />
        </div>
      </div>

      {/* RIGHT SIDE – BOOK BUTTON */}
      <div className="flex justify-end md:self-end">
        <button
          onClick={onBookHandler}
          className="bg-primary text-white px-10 py-3 rounded hover:bg-primary/90 transition-all"
        >
          Book Now!
        </button>
      </div>

    </div>
  </div>
</div>

  );
};

export default DateSelect;
