import { Schema, model, models, InferSchemaType, Types } from 'mongoose';

const applicationSchema = new Schema(
  {
    job: {
      type: Types.ObjectId,
      ref: 'Job',
      required: true
    },
    seeker: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String
    }
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: { job: 1, seeker: 1 },
        options: { unique: true }
      }
    ]
  }
);

applicationSchema.index({ job: 1, seeker: 1 }, { unique: true });

export type ApplicationDocument = InferSchemaType<typeof applicationSchema>;

export const ApplicationModel = models.Application || model('Application', applicationSchema);
