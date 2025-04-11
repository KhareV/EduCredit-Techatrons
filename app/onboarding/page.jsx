"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  GraduationCap,
  BadgeCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Layout from "../components/layout/Layout";

// Current user information
const currentTime = "2025-04-05 17:35:56";
const currentUser = "vkhare2909";

// Define steps
const steps = [
  "Personal Details",
  "Educational Background",
  "Skills & Interests",
  "Career Goals",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalDetails: {
      name: "",
      location: "",
      bio: "",
    },
    education: {
      level: "high_school",
      institution: "",
      major: "",
      gradYear: "",
    },
    skills: {
      selectedSkills: [],
      interests: [],
    },
    career: {
      goals: "",
      preferredIndustries: [],
      salaryExpectation: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        personalDetails: {
          ...prev.personalDetails,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          // You could also set the email from user.primaryEmailAddress.emailAddress if needed
        },
      }));
    }
  }, [isLoaded, user]);

  // Handle input change
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error when field is updated
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  // Handle array fields (skills, interests, etc.)
  const handleArrayUpdate = (section, field, value, action) => {
    setFormData((prev) => {
      const current = [...prev[section][field]];

      if (action === "add" && !current.includes(value)) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: [...current, value],
          },
        };
      } else if (action === "remove") {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: current.filter((item) => item !== value),
          },
        };
      }

      return prev;
    });
  };

  // Handle next step
  const handleNextStep = () => {
    // Validate current step
    const currentErrors = {};

    if (currentStep === 0) {
      // Validate personal details
      if (!formData.personalDetails.name) {
        currentErrors["personalDetails.name"] = "Name is required";
      }
      if (!formData.personalDetails.location) {
        currentErrors["personalDetails.location"] = "Location is required";
      }
    } else if (currentStep === 1) {
      // Validate education
      if (!formData.education.institution) {
        currentErrors["education.institution"] = "Institution is required";
      }
      if (!formData.education.gradYear) {
        currentErrors["education.gradYear"] = "Graduation year is required";
      }
    } else if (currentStep === 2) {
      // Validate skills
      if (formData.skills.selectedSkills.length === 0) {
        currentErrors["skills.selectedSkills"] =
          "Please select at least one skill";
      }
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    // Go to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Make API call to save onboarding data
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save onboarding data");
      }

      // Show success message
      toast.success("Profile completed successfully!");

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setApiError(error.message);
      toast.error("Failed to save your profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Sample skill options
  const skillOptions = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Data Analysis",
    "Machine Learning",
    "UI/UX Design",
    "Product Management",
    "Digital Marketing",
    "Content Creation",
    "Leadership",
    "Project Management",
    "Communication",
    "Problem Solving",
  ];

  // Sample industry options
  const industryOptions = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Media",
    "Retail",
    "Manufacturing",
    "Consulting",
    "Non-profit",
  ];

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-slate-950 text-white relative">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-blue-500/5 blur-3xl rounded-full transform-gpu"></div>
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-500/5 blur-3xl rounded-full transform-gpu"></div>
          <div className="absolute top-1/3 left-1/4 w-[30%] h-[30%] bg-purple-500/5 blur-3xl rounded-full transform-gpu"></div>
        </div>

        {/* User info in the bottom corner */}
        <div className="fixed bottom-2 right-2 text-slate-500 text-xs flex items-center gap-1 opacity-70">
          <span>{currentTime}</span>
          <span className="w-1 h-1 rounded-full bg-slate-500"></span>
          <span>{currentUser}</span>
        </div>

        <header className="border-b border-slate-800 backdrop-blur-sm bg-slate-900/50 z-10 relative">
          <div className="container mx-auto py-4 px-4 flex items-center justify-between">
            <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              SkillBridgege Pro
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Skip for now
            </Button>
          </div>
        </header>

        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                Complete Your Profile
              </h1>
              <p className="text-slate-400 mt-3">
                Let's personalize your experience to help you get the most out
                of SkillBridge Pro
              </p>
            </div>

            {/* API Error Message */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-300">
                <AlertCircle className="h-5 w-5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Progress bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">
                  Profile completion
                </span>
                <span className="text-sm text-slate-400">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800/70 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="hidden md:flex items-center mb-10">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 ${
                      currentStep > index
                        ? "bg-blue-500 text-white"
                        : currentStep === index
                        ? "border-2 border-blue-500 text-blue-400"
                        : "border-2 border-slate-700 text-slate-500"
                    }`}
                  >
                    {currentStep > index ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <span
                    className={`ml-3 font-medium transition-colors duration-300 ${
                      currentStep === index ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-slate-800 mx-4"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile steps indicator */}
            <div className="md:hidden flex items-center justify-center mb-8">
              <span className="text-slate-300 font-medium">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
              </span>
            </div>

            {/* Form container */}
            <motion.div
              initial={{ opacity: 0.9, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-6 md:p-8 backdrop-blur-sm shadow-xl shadow-blue-950/10 mb-8"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[300px]"
                >
                  {/* Step 1: Personal Details */}
                  {currentStep === 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                        <User className="h-5 w-5 text-blue-400" />
                        Personal Details
                      </h2>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Full Name
                          </label>
                          <Input
                            value={formData.personalDetails.name}
                            onChange={(e) =>
                              handleInputChange(
                                "personalDetails",
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Your full name"
                            className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              errors["personalDetails.name"]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {errors["personalDetails.name"] && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors["personalDetails.name"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Location
                          </label>
                          <Input
                            value={formData.personalDetails.location}
                            onChange={(e) =>
                              handleInputChange(
                                "personalDetails",
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="City, State/Province, Country"
                            className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              errors["personalDetails.location"]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {errors["personalDetails.location"] && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors["personalDetails.location"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Bio
                          </label>
                          <textarea
                            value={formData.personalDetails.bio}
                            onChange={(e) =>
                              handleInputChange(
                                "personalDetails",
                                "bio",
                                e.target.value
                              )
                            }
                            placeholder="Tell us a little about yourself..."
                            className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Educational Background */}
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                        <GraduationCap className="h-5 w-5 text-blue-400" />
                        Educational Background
                      </h2>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Education Level
                          </label>
                          <select
                            value={formData.education.level}
                            onChange={(e) =>
                              handleInputChange(
                                "education",
                                "level",
                                e.target.value
                              )
                            }
                            className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                          >
                            <option value="high_school">High School</option>
                            <option value="some_college">Some College</option>
                            <option value="associates">
                              Associate's Degree
                            </option>
                            <option value="bachelors">Bachelor's Degree</option>
                            <option value="masters">Master's Degree</option>
                            <option value="doctorate">Doctorate</option>
                            <option value="bootcamp">Bootcamp</option>
                            <option value="self_taught">Self-Taught</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Institution
                          </label>
                          <Input
                            value={formData.education.institution}
                            onChange={(e) =>
                              handleInputChange(
                                "education",
                                "institution",
                                e.target.value
                              )
                            }
                            placeholder="School, college, or university name"
                            className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              errors["education.institution"]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {errors["education.institution"] && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors["education.institution"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Field of Study
                          </label>
                          <Input
                            value={formData.education.major}
                            onChange={(e) =>
                              handleInputChange(
                                "education",
                                "major",
                                e.target.value
                              )
                            }
                            placeholder="Major or field of study"
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Graduation Year
                          </label>
                          <Input
                            type="number"
                            value={formData.education.gradYear}
                            onChange={(e) =>
                              handleInputChange(
                                "education",
                                "gradYear",
                                e.target.value
                              )
                            }
                            placeholder="Graduation year (e.g., 2023)"
                            min="1950"
                            max="2030"
                            className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              errors["education.gradYear"]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {errors["education.gradYear"] && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors["education.gradYear"]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Skills & Interests */}
                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                        <BadgeCheck className="h-5 w-5 text-blue-400" />
                        Skills & Interests
                      </h2>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Your Skills
                          </label>
                          <p className="text-sm text-slate-400 mb-4">
                            Select the skills you have. You'll be able to verify
                            these later.
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.skills.selectedSkills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center bg-blue-500/20 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-500/30"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleArrayUpdate(
                                      "skills",
                                      "selectedSkills",
                                      skill,
                                      "remove"
                                    )
                                  }
                                  className="ml-1.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-blue-400/20 transition-colors"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>

                          {errors["skills.selectedSkills"] && (
                            <p className="mt-1 mb-3 text-sm text-red-400">
                              {errors["skills.selectedSkills"]}
                            </p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {skillOptions
                              .filter(
                                (skill) =>
                                  !formData.skills.selectedSkills.includes(
                                    skill
                                  )
                              )
                              .map((skill) => (
                                <div
                                  key={skill}
                                  className="border border-slate-700 bg-slate-800/30 rounded-md p-2 cursor-pointer hover:bg-slate-800/70 hover:border-blue-500/30 transition-all duration-200"
                                  onClick={() =>
                                    handleArrayUpdate(
                                      "skills",
                                      "selectedSkills",
                                      skill,
                                      "add"
                                    )
                                  }
                                >
                                  <span className="text-sm text-slate-300">
                                    {skill}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Your Interests
                          </label>
                          <p className="text-sm text-slate-400 mb-4">
                            Select topics you're interested in learning more
                            about.
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.skills.interests.map((interest) => (
                              <span
                                key={interest}
                                className="inline-flex items-center bg-slate-800/50 text-slate-300 text-sm px-3 py-1 rounded-full border border-slate-700"
                              >
                                {interest}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleArrayUpdate(
                                      "skills",
                                      "interests",
                                      interest,
                                      "remove"
                                    )
                                  }
                                  className="ml-1.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {skillOptions
                              .filter(
                                (skill) =>
                                  !formData.skills.interests.includes(skill)
                              )
                              .map((skill) => (
                                <div
                                  key={skill}
                                  className="border border-slate-700 bg-slate-800/30 rounded-md p-2 cursor-pointer hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200"
                                  onClick={() =>
                                    handleArrayUpdate(
                                      "skills",
                                      "interests",
                                      skill,
                                      "add"
                                    )
                                  }
                                >
                                  <span className="text-sm text-slate-300">
                                    {skill}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Career Goals */}
                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                        <Briefcase className="h-5 w-5 text-blue-400" />
                        Career Goals
                      </h2>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Career Objectives
                          </label>
                          <textarea
                            value={formData.career.goals}
                            onChange={(e) =>
                              handleInputChange(
                                "career",
                                "goals",
                                e.target.value
                              )
                            }
                            placeholder="What are your career goals? What do you hope to achieve professionally?"
                            className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Preferred Industries
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.career.preferredIndustries.map(
                              (industry) => (
                                <span
                                  key={industry}
                                  className="inline-flex items-center bg-indigo-500/20 text-indigo-300 text-sm px-3 py-1 rounded-full border border-indigo-500/30"
                                >
                                  {industry}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleArrayUpdate(
                                        "career",
                                        "preferredIndustries",
                                        industry,
                                        "remove"
                                      )
                                    }
                                    className="ml-1.5 h-4 w-4 rounded-full flex items-center justify-center hover:bg-indigo-400/20 transition-colors"
                                  >
                                    ×
                                  </button>
                                </span>
                              )
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {industryOptions
                              .filter(
                                (industry) =>
                                  !formData.career.preferredIndustries.includes(
                                    industry
                                  )
                              )
                              .map((industry) => (
                                <div
                                  key={industry}
                                  className="border border-slate-700 bg-slate-800/30 rounded-md p-2 cursor-pointer hover:bg-slate-800/70 hover:border-indigo-500/30 transition-all duration-200"
                                  onClick={() =>
                                    handleArrayUpdate(
                                      "career",
                                      "preferredIndustries",
                                      industry,
                                      "add"
                                    )
                                  }
                                >
                                  <span className="text-sm text-slate-300">
                                    {industry}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Salary Expectations
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400">
                              <DollarSign size={16} />
                            </div>
                            <Input
                              type="number"
                              value={formData.career.salaryExpectation}
                              onChange={(e) =>
                                handleInputChange(
                                  "career",
                                  "salaryExpectation",
                                  e.target.value
                                )
                              }
                              placeholder="Annual salary expectation (e.g., 60000)"
                              className="pl-8 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            This helps us provide appropriate funding and career
                            options
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={`border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all ${
                  currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={handleNextStep}
                disabled={isSubmitting}
                className={`bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white border-none shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all ${
                  isSubmitting ? "opacity-80" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    Complete Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
