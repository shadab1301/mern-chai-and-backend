import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const vedioSchema = new Schema(
  {
    thumbnail: {
      type: String, //Cloudnary url
      required: [true, "VideoFile is requird"],
    },

    videoFile: {
      type: String, //Cloudnary url
      required: [true, "VideoFile is requird"],
    },
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    duration: {
      type: Number,
      required:true
    },
    views: {
      type: Number,
      default:0,
    },
    isPublished: {
      type: Boolean,
      default:true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


vedioSchema.plugin(mongooseAggregatePaginate);

export const Vedio = mongoose.Model("Vedio", vedioSchema);