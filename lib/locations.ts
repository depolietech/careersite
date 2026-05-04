export type LocationOption = { value: string; label: string };

export const COUNTRIES: LocationOption[] = [
  { value: "",        label: "Select country" },
  { value: "Remote",  label: "Remote (anywhere)" },
  { value: "Canada",  label: "Canada" },
  { value: "USA",     label: "United States" },
  { value: "Mexico",  label: "Mexico" },
];

export const STATES: Record<string, LocationOption[]> = {
  Canada: [
    { value: "", label: "Select province/territory" },
    { value: "Alberta",                    label: "Alberta" },
    { value: "British Columbia",           label: "British Columbia" },
    { value: "Manitoba",                   label: "Manitoba" },
    { value: "New Brunswick",              label: "New Brunswick" },
    { value: "Newfoundland and Labrador",  label: "Newfoundland and Labrador" },
    { value: "Northwest Territories",      label: "Northwest Territories" },
    { value: "Nova Scotia",                label: "Nova Scotia" },
    { value: "Nunavut",                    label: "Nunavut" },
    { value: "Ontario",                    label: "Ontario" },
    { value: "Prince Edward Island",       label: "Prince Edward Island" },
    { value: "Quebec",                     label: "Quebec" },
    { value: "Saskatchewan",               label: "Saskatchewan" },
    { value: "Yukon",                      label: "Yukon" },
  ],
  USA: [
    { value: "", label: "Select state" },
    { value: "Alabama",        label: "Alabama" },
    { value: "Alaska",         label: "Alaska" },
    { value: "Arizona",        label: "Arizona" },
    { value: "Arkansas",       label: "Arkansas" },
    { value: "California",     label: "California" },
    { value: "Colorado",       label: "Colorado" },
    { value: "Connecticut",    label: "Connecticut" },
    { value: "Delaware",       label: "Delaware" },
    { value: "Florida",        label: "Florida" },
    { value: "Georgia",        label: "Georgia" },
    { value: "Hawaii",         label: "Hawaii" },
    { value: "Idaho",          label: "Idaho" },
    { value: "Illinois",       label: "Illinois" },
    { value: "Indiana",        label: "Indiana" },
    { value: "Iowa",           label: "Iowa" },
    { value: "Kansas",         label: "Kansas" },
    { value: "Kentucky",       label: "Kentucky" },
    { value: "Louisiana",      label: "Louisiana" },
    { value: "Maine",          label: "Maine" },
    { value: "Maryland",       label: "Maryland" },
    { value: "Massachusetts",  label: "Massachusetts" },
    { value: "Michigan",       label: "Michigan" },
    { value: "Minnesota",      label: "Minnesota" },
    { value: "Mississippi",    label: "Mississippi" },
    { value: "Missouri",       label: "Missouri" },
    { value: "Montana",        label: "Montana" },
    { value: "Nebraska",       label: "Nebraska" },
    { value: "Nevada",         label: "Nevada" },
    { value: "New Hampshire",  label: "New Hampshire" },
    { value: "New Jersey",     label: "New Jersey" },
    { value: "New Mexico",     label: "New Mexico" },
    { value: "New York",       label: "New York" },
    { value: "North Carolina", label: "North Carolina" },
    { value: "North Dakota",   label: "North Dakota" },
    { value: "Ohio",           label: "Ohio" },
    { value: "Oklahoma",       label: "Oklahoma" },
    { value: "Oregon",         label: "Oregon" },
    { value: "Pennsylvania",   label: "Pennsylvania" },
    { value: "Rhode Island",   label: "Rhode Island" },
    { value: "South Carolina", label: "South Carolina" },
    { value: "South Dakota",   label: "South Dakota" },
    { value: "Tennessee",      label: "Tennessee" },
    { value: "Texas",          label: "Texas" },
    { value: "Utah",           label: "Utah" },
    { value: "Vermont",        label: "Vermont" },
    { value: "Virginia",       label: "Virginia" },
    { value: "Washington",     label: "Washington" },
    { value: "West Virginia",  label: "West Virginia" },
    { value: "Wisconsin",      label: "Wisconsin" },
    { value: "Wyoming",        label: "Wyoming" },
    { value: "Washington D.C.", label: "Washington D.C." },
  ],
  Mexico: [
    { value: "", label: "Select state" },
    { value: "Aguascalientes",       label: "Aguascalientes" },
    { value: "Baja California",      label: "Baja California" },
    { value: "Baja California Sur",  label: "Baja California Sur" },
    { value: "Campeche",             label: "Campeche" },
    { value: "Chiapas",              label: "Chiapas" },
    { value: "Chihuahua",            label: "Chihuahua" },
    { value: "Ciudad de Mexico",     label: "Ciudad de México (CDMX)" },
    { value: "Coahuila",             label: "Coahuila" },
    { value: "Colima",               label: "Colima" },
    { value: "Durango",              label: "Durango" },
    { value: "Guanajuato",           label: "Guanajuato" },
    { value: "Guerrero",             label: "Guerrero" },
    { value: "Hidalgo",              label: "Hidalgo" },
    { value: "Jalisco",              label: "Jalisco" },
    { value: "Mexico State",         label: "Estado de México" },
    { value: "Michoacan",            label: "Michoacán" },
    { value: "Morelos",              label: "Morelos" },
    { value: "Nayarit",              label: "Nayarit" },
    { value: "Nuevo Leon",           label: "Nuevo León" },
    { value: "Oaxaca",               label: "Oaxaca" },
    { value: "Puebla",               label: "Puebla" },
    { value: "Queretaro",            label: "Querétaro" },
    { value: "Quintana Roo",         label: "Quintana Roo" },
    { value: "San Luis Potosi",      label: "San Luis Potosí" },
    { value: "Sinaloa",              label: "Sinaloa" },
    { value: "Sonora",               label: "Sonora" },
    { value: "Tabasco",              label: "Tabasco" },
    { value: "Tamaulipas",           label: "Tamaulipas" },
    { value: "Tlaxcala",             label: "Tlaxcala" },
    { value: "Veracruz",             label: "Veracruz" },
    { value: "Yucatan",              label: "Yucatán" },
    { value: "Zacatecas",            label: "Zacatecas" },
  ],
};

/** Parse a combined "Country, State" string back into parts */
export function parseLocation(location: string | null | undefined): { country: string; state: string } {
  if (!location) return { country: "", state: "" };
  if (location === "Remote") return { country: "Remote", state: "" };
  const idx = location.indexOf(", ");
  if (idx === -1) return { country: location, state: "" };
  return { country: location.slice(0, idx), state: location.slice(idx + 2) };
}

/** Build the stored location string from country + state */
export function buildLocation(country: string, state: string): string {
  if (!country) return "";
  if (country === "Remote" || !state) return country;
  return `${country}, ${state}`;
}

export const CURRENCY_LABEL: Record<string, string> = {
  Canada: "CAD",
  Mexico: "MXN",
};
