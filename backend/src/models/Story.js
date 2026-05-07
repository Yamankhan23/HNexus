import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    hnId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    url: { type: String },
    points: { type: Number, default: 0 },
    author: { type: String },
    postedAt: { type: Date },
    rank: { type: Number },
    isActive: { type: Boolean, default: true },
    scrapedAt: { type: Date },
  },
  { timestamps: true }
);

storySchema.index({ title: 1, author: 1 }, { unique: true });

const Story = mongoose.model("Story", storySchema);

export default Story;
