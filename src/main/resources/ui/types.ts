export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  username: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  username: string;
  name?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
}

export interface PermissionDTO {
  id: number;
  name: string;
  description?: string;
}

export interface RoleDTO {
  id: number;
  name: string;
  description?: string;
  permissions: PermissionDTO[];
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  password?: string;
  isActive: boolean;
  roles: string[];
}

export interface CustomerDTO {
  customerId?: number;
  name: string;
  phone?: string;
}

export interface DoctorDTO {
  doctorId?: number;
  name: string;
}

export interface FrameDTO {
  frameCode: string;
  model?: string;
  price: number;
}

export interface LensDTO {
  lensCode: string;
  type?: string;
  price: number;
}

export type EyeSide = 'RE' | 'LE';
export type UsageType = 'DIST' | 'READ';

export interface EyePrescriptionDTO {
  prescriptionId?: number;
  orderId?: number;
  orderCode?: string;
  eyeSide: EyeSide;
  usageType: UsageType;
  sph?: number | string;
  cyl?: number | string;
  axis?: number | string;
}

export interface OrderDTO {
  orderId?: number;
  orderCode?: string;
  customerId?: number;
  customerName?: string;
  doctorId?: number;
  doctorName?: string;
  frameCode?: string;
  frameModel?: string;
  framePrice?: number;
  lensCode?: string;
  lensType?: string;
  lensPrice?: number;
  orderDate: string;
  measureDate?: string;
  measureTime?: string;
  total?: number;
  advance?: number;
  balanceStatus?: string;
  prescriptions?: EyePrescriptionDTO[];
}

export interface CompanySettingsDTO {
  id?: number;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  invoiceTitle?: string;
  footerNote?: string;
  taglineMm?: string;
  logoBase64?: string;
  voucherConfigJson?: string;
  orderPrefix?: string;
  orderDigits?: number;
}

export interface VoucherPrintSettingsDTO {
  id?: number;
  paperSize?: string;
  paperWidthMm?: number;
  paperHeightMm?: number;
  marginTopMm?: number;
  marginRightMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  primaryColor?: string;
  paperColor?: string;
  showLogo?: boolean;
  showClinicName?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  showFooterNotice?: boolean;
  showSerial?: boolean;
  logoWidthPx?: number;
  headerFontSizePx?: number;
  bodyFontSizePx?: number;
  tableFontSizePx?: number;
  contactFontSizePx?: number;
  amountFontSizePx?: number;
  eyeTitleFontSizePx?: number;
  footerFontSizePx?: number;
  serialFontSizePx?: number;
  lineHeightPx?: number;
  voucherTitle?: string;
  nameLabel?: string;
  frameLabel?: string;
  lensLabel?: string;
  doctorLabel?: string;
  dateLabel?: string;
  measureDateLabel?: string;
  measureTimeLabel?: string;
  currencyLabel?: string;
  footerNotice?: string;
}
