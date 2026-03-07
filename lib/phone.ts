export const normalizePhone = (phone: string) => {
	const digits = phone.replace(/\D+/g, "");

	if (digits.startsWith("0")) {
		return `33${digits.slice(1)}`;
	}

	return digits;
};

export const phoneToPseudoEmail = (phone: string) => `${normalizePhone(phone)}@picotosfamily.app`;
