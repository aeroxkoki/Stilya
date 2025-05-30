// Mock for image assets during tests
jest.mock('../../assets/images/onboarding/welcome.png', () => require('../../assets/images/onboarding/placeholder').welcome);
jest.mock('../../assets/images/onboarding/gender.png', () => require('../../assets/images/onboarding/placeholder').gender);
jest.mock('../../assets/images/onboarding/style.png', () => require('../../assets/images/onboarding/placeholder').style);
jest.mock('../../assets/images/onboarding/age.png', () => require('../../assets/images/onboarding/placeholder').age);
jest.mock('../../assets/images/onboarding/complete.png', () => require('../../assets/images/onboarding/placeholder').complete);

// Any other test setup logic can be added here
