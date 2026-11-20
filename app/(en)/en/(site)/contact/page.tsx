import { ContactTemplate } from "@/templates/contact/ContactTemplate";
import { contactMetadata } from "@/templates/contact/metadata";

export const revalidate = 3600;

export function generateMetadata() {
  return contactMetadata("en");
}

export default function Page() {
  return <ContactTemplate lang="en" />;
}
