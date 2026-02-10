import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/getUser";
import SignupForm from "./signup-form"

export default async function SignupPage() {
    const user = await getCurrentUser();
    if (user) {
        redirect("/tasks");
    }

    return <SignupForm />;
}
