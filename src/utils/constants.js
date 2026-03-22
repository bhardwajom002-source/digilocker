export const RELATIONS = [
  'Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter',
  'Brother', 'Sister', 'Grandfather', 'Grandmother',
  'Father-in-law', 'Mother-in-law', 'Uncle', 'Aunt', 'Other'
];

export const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#d97706',
  '#059669', '#0891b2', '#0284c7', '#64748b', '#374151',
  '#be185d', '#b45309'
];

export const DOC_CATEGORIES = {
  identity: { label: 'Identity', icon: 'BadgeCheck', color: '#4f46e5', bg: '#eef2ff' },
  financial: { label: 'Financial', icon: 'Landmark', color: '#059669', bg: '#ecfdf5' },
  education: { label: 'Education', icon: 'GraduationCap', color: '#7c3aed', bg: '#f5f3ff' },
  medical: { label: 'Medical', icon: 'HeartPulse', color: '#dc2626', bg: '#fef2f2' },
  property: { label: 'Property', icon: 'Home', color: '#d97706', bg: '#fffbeb' },
  vehicle: { label: 'Vehicle', icon: 'Car', color: '#0891b2', bg: '#ecfeff' },
  employment: { label: 'Employment', icon: 'Briefcase', color: '#374151', bg: '#f9fafb' },
  certificate: { label: 'Certificate', icon: 'Award', color: '#db2777', bg: '#fdf2f8' },
  other: { label: 'Other', icon: 'FolderOpen', color: '#64748b', bg: '#f8fafc' },
};

export const DOC_TYPES = {
  identity: [
    { value: 'aadhar', label: 'Aadhar Card', multiFile: true, hasExpiry: false, numberFormat: 'XXXX-XXXX-XXXX' },
    { value: 'pan', label: 'PAN Card', multiFile: false, hasExpiry: false, numberFormat: 'AAAAA9999A' },
    { value: 'passport', label: 'Passport', multiFile: false, hasExpiry: true, expiryYears: 10 },
    { value: 'voter_id', label: 'Voter ID', multiFile: false, hasExpiry: false },
    { value: 'driving_license', label: 'Driving License', multiFile: false, hasExpiry: true, expiryYears: 20 },
    { value: 'ration_card', label: 'Ration Card', multiFile: false, hasExpiry: false },
    { value: 'birth_cert', label: 'Birth Certificate', multiFile: false, hasExpiry: false },
  ],
  financial: [
    { value: 'bank_passbook', label: 'Bank Passbook', multiFile: true },
    { value: 'bank_statement', label: 'Bank Statement', multiFile: true },
    { value: 'fd_cert', label: 'FD Certificate', multiFile: false, hasExpiry: true },
    { value: 'insurance', label: 'Insurance Policy', multiFile: false, hasExpiry: true },
    { value: 'itr', label: 'Income Tax Return', multiFile: true },
    { value: 'form16', label: 'Form 16', multiFile: false },
    { value: 'loan_doc', label: 'Loan Document', multiFile: true },
    { value: 'investment', label: 'Investment Proof', multiFile: true },
  ],
  education: [
    { value: 'class10_marksheet', label: '10th Marksheet' },
    { value: 'class10_cert', label: '10th Certificate' },
    { value: 'class12_marksheet', label: '12th Marksheet' },
    { value: 'class12_cert', label: '12th Certificate' },
    { value: 'diploma_cert', label: 'Diploma Certificate' },
    { value: 'diploma_marksheet', label: 'Diploma Marksheets', multiFile: true },
    { value: 'degree_cert', label: 'Degree Certificate' },
    { value: 'degree_marksheet', label: 'Degree Marksheets', multiFile: true },
    { value: 'migration_cert', label: 'Migration Certificate' },
    { value: 'provisional_cert', label: 'Provisional Certificate' },
    { value: 'transcript', label: 'Transcript', multiFile: true },
    { value: 'school_leaving', label: 'School Leaving Certificate' },
  ],
  medical: [
    { value: 'abha', label: 'ABHA Card' },
    { value: 'ayushman', label: 'Ayushman Bharat Card' },
    { value: 'covid_vaccine', label: 'COVID Vaccination Certificate' },
    { value: 'vaccine_cert', label: 'Other Vaccination Certificate' },
    { value: 'medical_report', label: 'Medical Reports', multiFile: true },
    { value: 'prescription', label: 'Prescription', multiFile: true },
    { value: 'disability', label: 'Disability Certificate' },
    { value: 'health_insurance', label: 'Health Insurance Card', hasExpiry: true },
  ],
  property: [
    { value: 'property_papers', label: 'Property Papers', multiFile: true },
    { value: 'land_record', label: 'Land Records', multiFile: true },
    { value: 'house_tax', label: 'House Tax Receipt', hasExpiry: true },
    { value: 'sale_deed', label: 'Sale Deed', multiFile: true },
    { value: 'rent_agreement', label: 'Rent Agreement', hasExpiry: true },
    { value: 'electricity', label: 'Electricity Bill', hasExpiry: false },
    { value: 'gas_papers', label: 'Gas Connection Papers' },
  ],
  vehicle: [
    { value: 'rc_book', label: 'RC Book (Registration)', hasExpiry: true },
    { value: 'vehicle_insurance', label: 'Vehicle Insurance', hasExpiry: true },
    { value: 'puc', label: 'Pollution Certificate (PUC)', hasExpiry: true, expiryMonths: 6 },
    { value: 'challan', label: 'Challan Receipt' },
  ],
  employment: [
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'salary_slip', label: 'Salary Slips', multiFile: true },
    { value: 'experience_cert', label: 'Experience Certificate' },
    { value: 'relieving', label: 'Relieving Letter' },
    { value: 'appointment', label: 'Appointment Letter' },
    { value: 'employee_id', label: 'Employee ID Card', hasExpiry: true },
    { value: 'noc', label: 'NOC Letter' },
  ],
  certificate: [
    { value: 'caste_cert', label: 'Caste Certificate' },
    { value: 'domicile', label: 'Domicile Certificate' },
    { value: 'income_cert', label: 'Income Certificate' },
    { value: 'marriage_cert', label: 'Marriage Certificate' },
    { value: 'death_cert', label: 'Death Certificate' },
    { value: 'character', label: 'Character Certificate' },
    { value: 'police_verify', label: 'Police Verification' },
    { value: 'sports', label: 'Sports Certificate', multiFile: true },
    { value: 'ncc', label: 'NCC Certificate' },
  ],
  other: [
    { value: 'custom', label: 'Other / Custom' },
  ],
};

export const EXPIRY_WARNING_DAYS = {
  critical: 7,
  warning: 30,
  notice: 90,
};

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILES_PER_DOC = 10;
export const MAX_MEMBERS = 50;
export const AUTO_LOCK_OPTIONS = [5, 10, 15, 30, 60];
export const COMPRESSION_OPTIONS = [
  { label: 'Original Quality', value: 1.0 },
  { label: 'High (80%)', value: 0.8 },
  { label: 'Medium (60%)', value: 0.6 },
  { label: 'Low (40%)', value: 0.4 },
];

export const getCategoryInfo = (category) => DOC_CATEGORIES[category] || DOC_CATEGORIES.other;
export const getDocTypeLabel = (category, docType) => {
  const types = DOC_TYPES[category] || [];
  const type = types.find(t => t.value === docType);
  return type?.label || docType;
};
