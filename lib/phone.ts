export const normalizePhone = (phone: string) => phone.replace(/\s+/g, "").replace(/^\+/, "");

export const phoneToPseudoEmail = (phone: string) => `${normalizePhone(phone)}@picotosfamily.app`;
