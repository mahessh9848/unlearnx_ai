export function validateStep(stepKey, value) {
  if (!value || String(value).trim() === "") {
    return "This field is required.";
  }

  if (stepKey === "careerGoal" && value.trim().length < 5) {
    return "Please describe your career goal in more detail.";
  }

  if (stepKey === "currentSkills" && value.trim().length < 2) {
    return "Please list at least one skill.";
  }

  return null;
}

export function validateAllSteps(formData) {
  const errors = {};
  const fields = ["careerGoal", "currentSkills", "targetIndustry", "experienceLevel", "priority"];

  for (const field of fields) {
    const error = validateStep(field, formData[field]);
    if (error) errors[field] = error;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
