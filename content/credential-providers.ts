type CredentialProvider = { src: string; alt: string };

export const credentialProviders: Readonly<
  Record<string, CredentialProvider | undefined>
> = {
  Cisco: { src: "images/logos/cisco.webp", alt: "Cisco logo" },
  DataCamp: { src: "images/logos/datacamp.webp", alt: "DataCamp logo" },
  // Static wordmark from https://www.anthropic.com/ ; original vector paths.
  Anthropic: { src: "images/logos/anthropic.svg", alt: "Anthropic logo" },
  // Official primary full-color logo, unchanged from https://brand.databricks.com/
  // Download: https://brandfolder.com/s/g587wt9tgz8sbqsrfc3m
  "Databricks Academy": {
    src: "images/logos/databricks.svg",
    alt: "Databricks logo",
  },
};
