import React, { forwardRef } from "react";
import CloudIcon from "./icons/CloudIcon";

const SubmitButton = forwardRef(
  ({ handleSubmit, size, totalTracks = 1 }, ref) => (
    <button
      ref={ref}
      onClick={async (e) => {
        e.preventDefault();

        await handleSubmit();
      }}
      className="mt-4 bg-emerald-600 text-white py-2 px-4 rounded-md formSubmit"
    >
      <CloudIcon />
      <p className="ml-1">
        {size} MB ({totalTracks})
      </p>
    </button>
  ),
);

export default SubmitButton;
