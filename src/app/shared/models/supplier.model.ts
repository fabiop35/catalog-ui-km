export interface Supplier {
    id: string;
    searchkey: string;
    taxid: string | null;
    name: string;
    maxdebt: number;
    address: string | null;
    address2: string | null;
    postal: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    phone: string | null;
    phone2: string | null;
    fax: string | null;
    notes: string | null;
    visible: boolean;
    curdate: string | null; // Use string for ISO date format
    curdebt: number | null;
    vatid: string | null;
}