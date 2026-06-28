import { Redirect } from "expo-router";
import React from "react";

export default function OtherRedirect() {
  return <Redirect href="/profile/addresses" />;
}
