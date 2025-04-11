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
  BadgeCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Building2,
  Landmark,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Layout from "../../components/layout/Layout";

const steps = [
  "Personal Details",
  "Professional Background",
  "Investment Preferences",
  "Portfolio Details",
];

export default function InvestorOnboardingPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    // Try to load from localStorage if available
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("investorOnboardingData");
      return savedData
        ? JSON.parse(savedData)
        : {
            personalDetails: {
              name: "",
              location: "",
              bio: "",
            },
            professional: {
              company: "",
              position: "",
              experience: "",
              industry: "",
            },
            investment: {
              focusAreas: [],
              checkSize: "",
              investmentStage: "",
            },
            portfolio: {
              currentInvestments: "",
              preferredVerticals: [],
              annualBudget: "",
            },
          };
    }
    return {
      personalDetails: {
        name: "",
        location: "",
        bio: "",
      },
      professional: {
        company: "",
        position: "",
        experience: "",
        industry: "",
      },
      investment: {
        focusAreas: [],
        checkSize: "",
        investmentStage: "",
      },
      portfolio: {
        currentInvestments: "",
        preferredVerticals: [],
        annualBudget: "",
      },
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("investorOnboardingData", JSON.stringify(formData));
    }
  }, [formData]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in/investor");
    }
  }, [isLoaded, isSignedIn, router]);

  // Pre-fill form with user data
  useEffect(() => {
    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        personalDetails: {
          ...prev.personalDetails,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
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

  // Handle array fields
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
      if (!formData.personalDetails.name?.trim()) {
        currentErrors["personalDetails.name"] = "Full name is required";
      } else if (formData.personalDetails.name.length < 3) {
        currentErrors["personalDetails.name"] =
          "Name must be at least 3 characters";
      }

      if (!formData.personalDetails.location?.trim()) {
        currentErrors["personalDetails.location"] = "Location is required";
      }

      if (formData.personalDetails.bio?.length > 500) {
        currentErrors["personalDetails.bio"] =
          "Bio must be less than 500 characters";
      }
    } else if (currentStep === 1) {
      if (!formData.professional.company?.trim()) {
        currentErrors["professional.company"] = "Company name is required";
      }

      if (!formData.professional.position?.trim()) {
        currentErrors["professional.position"] = "Position is required";
      }

      if (!formData.professional.experience) {
        currentErrors["professional.experience"] =
          "Years of experience is required";
      } else if (
        isNaN(formData.professional.experience) ||
        formData.professional.experience < 0
      ) {
        currentErrors["professional.experience"] = "Enter a valid number";
      }

      if (!formData.professional.industry) {
        currentErrors["professional.industry"] = "Industry is required";
      }
    } else if (currentStep === 2) {
      if (formData.investment.focusAreas.length === 0) {
        currentErrors["investment.focusAreas"] =
          "Select at least one focus area";
      }

      if (!formData.investment.checkSize) {
        currentErrors["investment.checkSize"] = "Check size is required";
      } else if (
        isNaN(formData.investment.checkSize) ||
        formData.investment.checkSize <= 0
      ) {
        currentErrors["investment.checkSize"] = "Enter a valid amount";
      }

      if (!formData.investment.investmentStage) {
        currentErrors["investment.investmentStage"] =
          "Investment stage is required";
      }
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

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
      const response = await fetch("/api/onboarding/investor", {
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

      toast.success("Onboarding completed successfully!");
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

  // Focus area options
  const focusAreaOptions = [
    "EdTech",
    "FinTech",
    "HealthTech",
    "AI/ML",
    "Blockchain",
    "SaaS",
    "Marketplaces",
    "Consumer",
  ];

  // Industry options
  const industryOptions = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Media",
    "Retail",
    "Manufacturing",
    "Consulting",
  ];

  // Investment stage options
  const stageOptions = ["Pre-seed", "Seed", "Series A", "Series B+"];

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-slate-950 text-white relative">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-blue-500/5 blur-3xl rounded-full transform-gpu"></div>
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-500/5 blur-3xl rounded-full transform-gpu"></div>
          <div className="absolute top-1/3 left-1/4 w-[30%] h-[30%] bg-purple-500/5 blur-3xl rounded-full transform-gpu"></div>
        </div>

        {/* Header */}
        <header className="border-b border-slate-800 backdrop-blur-sm bg-slate-900/50 z-10 relative">
          <div className="container mx-auto py-4 px-4 flex items-center justify-between">
            <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              SkillBridge Pro
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/investors")}
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
                Investor Onboarding
              </h1>
              <p className="text-slate-400 mt-3">
                Complete your investor profile to start funding education
                opportunities
              </p>
            </div>

            {/* Progress bar and steps indicator */}
            <div className="mb-10">
              <div className="flex justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        currentStep >= index
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {currentStep > index ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        currentStep >= index
                          ? "text-blue-400"
                          : "text-slate-500"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative h-1 bg-slate-800 rounded-full">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
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
                          <input
                            value={formData.personalDetails.name}
                            onChange={(e) =>
                              handleInputChange(
                                "personalDetails",
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Your full name"
                            className={`w-full rounded-md bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors ${
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
                          <input
                            value={formData.personalDetails.location}
                            onChange={(e) =>
                              handleInputChange(
                                "personalDetails",
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="City, Country"
                            className={`w-full rounded-md bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors ${
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
                            placeholder="Tell us about yourself"
                            className={`w-full rounded-md bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors ${
                              errors["personalDetails.bio"]
                                ? "border-red-500"
                                : ""
                            }`}
                            rows={3}
                          />
                          {errors["personalDetails.bio"] && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors["personalDetails.bio"]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Professional Background */}
                  {currentStep === 1 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                        <Building2 className="h-5 w-5 text-blue-400" />
                        Professional Background
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Company
                          </label>
                          <Input
                            value={formData.professional.company}
                            onChange={(e) =>
                              handleInputChange(
                                "professional",
                                "company",
                                e.target.value
                              )
                            }
                            placeholder="Your current company"
                            className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              errors["professional.company"]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {errors["professional.company"] && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors["professional.company"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Position
                          </label>
                          <Input
                            value={formData.professional.position}
                            onChange={(e) =>
                              handleInputChange(
                                "professional",
                                "position",
                                e.target.value
                              )
                            }
                            placeholder="Your current position"
                            className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              errors["professional.position"]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {errors["professional.position"] && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors["professional.position"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Years of Experience
                          </label>
                          <Input
                            type="number"
                            value={formData.professional.experience}
                            onChange={(e) =>
                              handleInputChange(
                                "professional",
                                "experience",
                                e.target.value
                              )
                            }
                            placeholder="Years in investing"
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Primary Industry
                          </label>
                          <select
                            value={formData.professional.industry}
                            onChange={(e) =>
                              handleInputChange(
                                "professional",
                                "industry",
                                e.target.value
                              )
                            }
                            className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                          >
                            <option value="">Select industry</option>
                            {industryOptions.map((industry) => (
                              <option key={industry} value={industry}>
                                {industry}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Investment Preferences */}
                  {currentStep === 2 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                        <Landmark className="h-5 w-5 text-blue-400" />
                        Investment Preferences
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Focus Areas
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.investment.focusAreas.map((area) => (
                              <span
                                key={area}
                                className="inline-flex items-center bg-blue-500/20 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-500/30"
                              >
                                {area}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleArrayUpdate(
                                      "investment",
                                      "focusAreas",
                                      area,
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
                          {errors["investment.focusAreas"] && (
                            <p className="mt-1 mb-3 text-sm text-red-400">
                              {errors["investment.focusAreas"]}
                            </p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {focusAreaOptions
                              .filter(
                                (area) =>
                                  !formData.investment.focusAreas.includes(area)
                              )
                              .map((area) => (
                                <motion.div
                                  key={area}
                                  className="border border-slate-700 bg-slate-800/30 rounded-md p-2 cursor-pointer hover:bg-slate-800/70 hover:border-blue-500/30 transition-all duration-200"
                                  onClick={() =>
                                    handleArrayUpdate(
                                      "investment",
                                      "focusAreas",
                                      area,
                                      "add"
                                    )
                                  }
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <span className="text-sm text-slate-300">
                                    {area}
                                  </span>
                                </motion.div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Typical Check Size ($)
                          </label>
                          <Input
                            value={formData.investment.checkSize}
                            onChange={(e) =>
                              handleInputChange(
                                "investment",
                                "checkSize",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 50000"
                            className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                              errors["investment.checkSize"]
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {errors["investment.checkSize"] && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors["investment.checkSize"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Preferred Investment Stage
                          </label>
                          <select
                            value={formData.investment.investmentStage}
                            onChange={(e) =>
                              handleInputChange(
                                "investment",
                                "investmentStage",
                                e.target.value
                              )
                            }
                            className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                          >
                            <option value="">Select stage</option>
                            {stageOptions.map((stage) => (
                              <option key={stage} value={stage}>
                                {stage}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Portfolio Details */}
                  {currentStep === 3 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                        <PieChart className="h-5 w-5 text-blue-400" />
                        Portfolio Details
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Current Investments
                          </label>
                          <textarea
                            value={formData.portfolio.currentInvestments}
                            onChange={(e) =>
                              handleInputChange(
                                "portfolio",
                                "currentInvestments",
                                e.target.value
                              )
                            }
                            placeholder="Briefly describe your current investment portfolio"
                            className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Preferred Verticals
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.portfolio.preferredVerticals.map(
                              (vertical) => (
                                <span
                                  key={vertical}
                                  className="inline-flex items-center bg-indigo-500/20 text-indigo-300 text-sm px-3 py-1 rounded-full border border-indigo-500/30"
                                >
                                  {vertical}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleArrayUpdate(
                                        "portfolio",
                                        "preferredVerticals",
                                        vertical,
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
                            {focusAreaOptions
                              .filter(
                                (area) =>
                                  !formData.portfolio.preferredVerticals.includes(
                                    area
                                  )
                              )
                              .map((area) => (
                                <motion.div
                                  key={area}
                                  className="border border-slate-700 bg-slate-800/30 rounded-md p-2 cursor-pointer hover:bg-slate-800/70 hover:border-indigo-500/30 transition-all duration-200"
                                  onClick={() =>
                                    handleArrayUpdate(
                                      "portfolio",
                                      "preferredVerticals",
                                      area,
                                      "add"
                                    )
                                  }
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <span className="text-sm text-slate-300">
                                    {area}
                                  </span>
                                </motion.div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">
                            Annual Investment Budget ($)
                          </label>
                          <Input
                            value={formData.portfolio.annualBudget}
                            onChange={(e) =>
                              handleInputChange(
                                "portfolio",
                                "annualBudget",
                                e.target.value
                              )
                            }
                            placeholder="Your annual budget for education investments"
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 0 ? (
                <Button
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 text-slate-300 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <div></div> // Empty div to maintain flex spacing
              )}

              <Button
                onClick={() => router.push("/investors")}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white"
              >
                {currentStep === steps.length - 1
                  ? "Complete Onboarding"
                  : "Next Step"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
