import { Schema, model, models, InferSchemaType, Types } from 'mongoose';

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    skills: {
      type: [String],
      default: []
    },
    location: {
      type: String,
      required: true
    },
    salary: {
      type: String
    },
    employer: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export type JobDocument = InferSchemaType<typeof jobSchema>;

export const JobModel = models.Job || model('Job', jobSchema);
