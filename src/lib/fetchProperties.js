import { supabase } from "./supabase";

export const fetchApprovedProperties = async () => {
  try {
    // Fetch approved properties
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (propertiesError) {
      console.error("Properties Error:", propertiesError);
      return [];
    }

    if (!properties?.length) {
      return [];
    }

    // Get all agent ids
    const agentIds = [
      ...new Set(
        properties
          .map((property) => property.agent_id)
          .filter(Boolean)
      ),
    ];

    console.log("Agent IDs:", agentIds);

    // Fetch agent profiles
    let profilesMap = {};

    if (agentIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", agentIds);

      if (profilesError) {
        console.error("Profiles Error:", profilesError);
      } else {
        profiles.forEach((profile) => {
          profilesMap[profile.id] = profile;
        });
      }
    }

    // Merge property with profile
    const mergedProperties = properties.map((property) => ({
      ...property,
      profiles: profilesMap[property.agent_id] || null,
    }));

    console.log("MERGED PROPERTIES:", mergedProperties);

    return mergedProperties;
  } catch (error) {
    console.error("fetchApprovedProperties Error:", error);
    return [];
  }
};