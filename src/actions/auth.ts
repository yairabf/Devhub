"use server";

import { signIn } from "@/auth";

export async function signInWithGitHub(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl");
  const redirectTo =
    typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard";

  await signIn("github", { redirectTo });
}
