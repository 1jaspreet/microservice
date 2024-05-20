
exports.created = string => `${string} created successfully.`;

exports.participated = string => `${string}  participation request has been sent.`;
exports.contribute = string => `${string}  have made contribution successfully.`;

exports.createdDraft = string => `${string} created as draft successfully.`;

exports.saved = string => `${string} saved successfully.`;

exports.updated = string => `${string} updated successfully.`;

exports.invited = string => `${string} invited successfully.`;

exports.confirmed = string => `${string} confirmed successfully.`;
exports.deliver = string => `${string} deliver successfully.`;

exports.rejected = string => `${string} rejected successfully.`;
exports.closed = string => `${string} has been closed successfully.`;

exports.deleted = string => `${string} deleted successfully.`;

exports.uploaded = string => `${string} uploaded successfully.`;

exports.removed = string => `${string} removed successfully.`;

exports.exists = string => `Oops, ${string} already exists.`;

exports.notFound = string => `${string} not found.`;

exports.duplicate = string => `Oops, duplicate entry! ${string} already exists.`;

exports.saveIssue = () => `There is some issue to save, please contact administrator.`;

exports.updateIssue = () => `There is some issue to update, please contact administrator.`;

exports.deleteIssue = () => `There is some issue to delete, please contact administrator.`;

exports.default = () => `There is some issue contact administrator.`;

exports.tryAgain = () => `There is some issue, please try again.`;

exports.duplicatePass = () => `Type of password is already use try another.`;

exports.mobile = () => `Oops! Your mobile does not exist in our system.`;

exports.schemeNotStarted = () => `Oops! PM SHRI School scheme not started.`;

exports.schemeNotOnState = () => `Oops! PM SHRI School scheme not started on state level.`;

exports.schoolNotEligible = () => `Oops! Invalid Credential or School is NOT eligible to Apply for PRABANDH.`;

exports.udise = () => `Oops! Your udise does not exist in our system.`;

exports.password = () => `Oops! Your password does not exist in our system.`;

exports.email = () => `Oops! Your email does not exist in our system.`;

exports.schoolOnboard = () => `School onboard successfully.`;

exports.AOnboard = () => `The School is already onboard.`;

exports.invalidOTP = () => `Invalid OTP, Please provide correct.`;

exports.captcha = () => `Oops! Invalid Captcha.`;

exports.unauthorized = () => `Oops! you are an unauthorized user.`;

exports.OPInvalid = () => `Oops! Old password is invalid.`;

exports.passwordUsed = () => `Oops! Password previously used, please use different.`;

exports.invalidLogin = () => `Oops! You have entered invalid credentials.`;

exports.logedIn = () => `Successfully Logedin`;

exports.passwordResetLink = () => `Password reset link sent on your registered email.`;

exports.status = (string, value) => {
    const status = (value == 1) ? 'activated' : 'deactivated';
    return `${string} ${status} successfully.`;
}
exports.invalidUdisecode = () => `Invalid invalidUdisecode, Please provide correct.`;
exports.approve = (string, value) => {
    const status = (value == 1) ? 'approved' : 'unapproved';
    return `${string} ${status} successfully.`;
}