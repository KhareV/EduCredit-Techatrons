// Note: This file is .js, using require for imports
const { NextResponse } = require("next/server");
const { auth } = require("@clerk/nextjs/server");
const mongoose = require("mongoose");
const connectToDB = require("@/lib/mongoose").default; // Use shared connection utility
const InvestorOnboarding =
  require("@/lib/db/models/InvestorOnboarding").default;
const StudentOnboarding = require("@/lib/db/models/StudentOnboarding").default;

// Define UserInfo schema (Keeping this as it seems to be the primary user store used here)
// Consider moving this to lib/db/models/UserInfo.js for consistency later
const UserInfoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    personalDetails: {
      name: String,
      location: String,
      bio: String,
    },
    education: {
      level: String,
      institution: String,
      major: String,
      gradYear: String,
    },
    skills: {
      selectedSkills: [String],
      interests: [String],
    },
    career: {
      goals: String,
      preferredIndustries: [String],
      salaryExpectation: String,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "UserInfo" }
);

// Get UserInfo model (or create if it doesn't exist)
const UserInfo =
  mongoose.models.UserInfo || mongoose.model("UserInfo", UserInfoSchema);

export async function POST(request) {
  try {
    // Verify authentication
    const { userId: clerkId } = await auth(); // Rename to clerkId for clarity
    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const data = await request.json();
    const role = data.role; // Assuming role is sent from frontend

    if (!role || (role !== "student" && role !== "investor")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User role ('student' or 'investor') is required in data payload.",
        },
        { status: 400 }
      );
    }

    // Connect to database using the utility
    await connectToDB();

    // --- Find or Create the main UserInfo document ---
    // Using clerkId which is stored in the 'userId' field of UserInfoSchema
    let userInfo = await UserInfo.findOne({ userId: clerkId });

    if (!userInfo) {
      // If UserInfo doesn't exist, create it (basic info might be needed here)
      // This assumes the webhook might not have created it yet, or it's the first login
      userInfo = new UserInfo({
        userId: clerkId,
        personalDetails: data.personalDetails || {}, // Add defaults if needed
        education: data.education || {},
        skills: data.skills || {},
        career: data.career || {},
      });
      await userInfo.save();
      console.log(`Created new UserInfo for clerkId: ${clerkId}`);
    } else {
      // Update existing UserInfo if needed (optional, could just rely on role-specific data)
      // For now, keep the existing update logic:
      userInfo.personalDetails =
        data.personalDetails || userInfo.personalDetails;
      userInfo.education = data.education || userInfo.education;
      userInfo.skills = data.skills || userInfo.skills;
      userInfo.career = data.career || userInfo.career;
      userInfo.updatedAt = new Date();
      await userInfo.save();
      console.log(`Updated UserInfo for clerkId: ${clerkId}`);
    }

    // --- Save Role-Specific Onboarding Data ---
    const userInfoId = userInfo._id; // Get the MongoDB ObjectId of the UserInfo doc

    if (role === "investor") {
      await InvestorOnboarding.findOneAndUpdate(
        { clerkId: clerkId }, // Find based on Clerk ID to ensure uniqueness
        {
          userId: userInfoId, // Link to the UserInfo document's _id
          clerkId: clerkId,
          investmentFocus: data.investmentFocus,
          preferredStages: data.preferredStages,
          portfolioSize: data.portfolioSize,
          companyName: data.companyName,
          roleInCompany: data.roleInCompany,
          riskAppetite: data.riskAppetite,
          linkedInProfile: data.linkedInProfile,
          website: data.website,
          accreditationStatus: data.accreditationStatus,
          onboardingData: data, // Store the full payload as catch-all for now
          completedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not found
      );
      console.log(`Upserted InvestorOnboarding for clerkId: ${clerkId}`);
    } else if (role === "student") {
      await StudentOnboarding.findOneAndUpdate(
        { clerkId: clerkId }, // Find based on Clerk ID
        {
          userId: userInfoId, // Link to the UserInfo document's _id
          clerkId: clerkId,
          educationalGoals: data.educationalGoals,
          careerAspirations: data.careerAspirations,
          preferredLearningStyle: data.preferredLearningStyle,
          skillsToDevelop: data.skillsToDevelop,
          fundingNeedReason: data.fundingNeedReason,
          location: data.personalDetails?.location, // Example: pull from main data
          dateOfBirth: data.dateOfBirth,
          currentEducationLevel: data.education?.level, // Example: pull from main data
          fieldOfStudy: data.education?.major, // Example: pull from main data
          onboardingData: data, // Store the full payload
          completedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not found
      );
      console.log(`Upserted StudentOnboarding for clerkId: ${clerkId}`);
    }

    // Return success, maybe don't return all the data anymore?
    return NextResponse.json({
      success: true,
      message: `Onboarding data saved successfully for ${role}.`,
      data: {
        userId: userInfo.userId,
        personalDetails: userInfo.personalDetails,
        education: userInfo.education,
        skills: userInfo.skills,
        career: userInfo.career,
      },
    });
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save onboarding data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
