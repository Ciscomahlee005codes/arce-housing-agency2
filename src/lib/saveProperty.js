// lib/saveProperty.js

import { supabase } from "./supabase";

export const saveProperty = async (
  userId,
  propertyId
) => {
  return await supabase
    .from("saved_properties")
    .insert([
      {
        user_id: userId,
        property_id: propertyId,
      },
    ]);
};
// =========================
// REMOVE SAVED PROPERTY
// =========================
export const removeSavedProperty =
  async (userId, propertyId) => {
    return await supabase
      .from("saved_properties")
      .delete()
      .eq("user_id", userId)
      .eq("property_id", propertyId);
  };
//   =========================
// GET SAVED PROPERTIES FOR USER
// =========================
export const isPropertySaved =
  async (userId, propertyId) => {
    const { data } = await supabase
      .from("saved_properties")
      .select("*")
      .eq("user_id", userId)
      .eq("property_id", propertyId)
      .maybeSingle();

    return !!data;
  };