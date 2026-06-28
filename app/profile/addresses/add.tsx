import { Redirect } from "expo-router";
import React from "react";

export default function AddRedirect() {
  return <Redirect href="/profile/addresses?add=true" />;
}
