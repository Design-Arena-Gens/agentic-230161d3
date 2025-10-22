import { Schema, model, models, InferSchemaType } from 'mongoose';

export type UserRole = 'employer' | 'seeker';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['employer', 'seeker']
    },
    name: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    experience: {
      type: String
    },
    preferredRole: {
      type: String
    },
    preferredLocation: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model('User', userSchema);
