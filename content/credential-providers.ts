type CredentialProvider = { src: string; alt: string };

export const credentialProviders: Readonly<
  Record<string, CredentialProvider | undefined>
> = {
  Cisco: { src: "images/logos/cisco.webp", alt: "Cisco logo" },
  DataCamp: { src: "images/logos/datacamp.webp", alt: "DataCamp logo" },
};
