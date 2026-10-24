type AwardAppLabel = {
  organisation: string;
  recognition: string;
};

// Short app labels are separate from the full record titles, which remain
// stable keys for certificates, photos, project notes, and provenance.
const labels: Readonly<Record<string, AwardAppLabel | undefined>> = {
  "BrainHack TIL-AI 2026": {
    organisation: "BrainHack TIL-AI",
    recognition: "Novice Champion",
  },
  "Hack the Future AI Hackathon 2026": {
    organisation: "Hack the Future AI Hackathon",
    recognition: "Champion",
  },
  "BügleRock Rockathon 2026": {
    organisation: "BügleRock Rockathon",
    recognition: "Top 5",
  },
  "SunnyHacks 2026": {
    organisation: "SunnyHacks",
    recognition: "2nd Place",
  },
  "SignMeUp · The Merge Hackathon 2026": {
    organisation: "The Merge Hackathon",
    // Placement supplied by Ian; the detailed record retains the certificate's
    // Honorary Recognition wording alongside the project name.
    recognition: "Top 20",
  },
  "Edusave Scholarships for Independent Schools (Yearly Award)": {
    organisation: "Ministry of Education",
    recognition: "Independent Schools Scholarship",
  },
  "CCC–CDC Education Merit Award": {
    organisation: "CCC–CDC",
    recognition: "Education Merit Award",
  },
  "Edusave Certificate of Academic Achievement": {
    organisation: "Ministry of Education",
    recognition: "Edusave Academic Achievement",
  },
  "Edusave Good Progress Award": {
    organisation: "Ministry of Education",
    recognition: "Edusave Good Progress Award",
  },
  "Dean’s List (Academic)": {
    organisation: "Eunoia Junior College",
    recognition: "Dean’s List · Academic",
  },
  "National School Games A Division · Softball": {
    organisation: "National School Games",
    recognition: "A Division Softball · Silver",
  },
  "SSSC Colours Award · Softball": {
    organisation: "SSSC",
    recognition: "Colours Award · Softball",
  },
  "Top GCE O-Level Performer": {
    organisation: "SST",
    recognition: "Top GCE O-Level Performer",
  },
  "Innofest · Best Business Pitch Award": {
    organisation: "Innofest",
    recognition: "Best Business Pitch Award",
  },
  "Innofest · Active Elderly Award": {
    organisation: "Innofest",
    recognition: "Active Elderly · 2nd Place",
  },
  "Sports Day - Athletics · SST": {
    organisation: "Sports Day",
    recognition: "Athletics",
  },
  "National Mathematical Olympiad of Singapore": {
    organisation: "National Mathematical Olympiad",
    recognition: "Bronze",
  },
  "KooBits Maths Challenge": {
    organisation: "KooBits Maths Challenge",
    recognition: "Top Brain of School",
  },
  "Sports Day - Athletics": {
    organisation: "Sports Day",
    recognition: "Athletics",
  },
  "SwimSafer Gold": {
    organisation: "SwimSafer",
    recognition: "Gold",
  },
  "Piano Grade 3 · Merit": {
    organisation: "Piano",
    recognition: "Grade 3 · Merit",
  },
  "Certificate of Appreciation · Project BHID": {
    organisation: "NUS Community Service Club",
    recognition: "Certificate of Appreciation",
  },
  "Chief of Defence Force (CDF) National Education Excellence Award": {
    organisation: "160 Squadron",
    recognition: "CDF National Education Excellence",
  },
  "National Service · Outstanding Performance & Conduct": {
    organisation: "Singapore Armed Forces",
    recognition: "Outstanding Performance & Conduct",
  },
  "IPPT Gold Award": {
    organisation: "Singapore Armed Forces",
    recognition: "IPPT Gold",
  },
  "Marksmanship Award": {
    organisation: "Singapore Armed Forces",
    recognition: "Marksmanship Award",
  },
  "AWS Cloud Practitioner (CLF-C02)": {
    organisation: "DataCamp",
    recognition: "AWS Cloud Practitioner Course",
  },
  "Cisco Content Networking Specialist Certification": {
    organisation: "Cisco",
    recognition: "Content Networking Specialist",
  },
};

export function awardAppLabel(record: { title: string; issuer: string }): AwardAppLabel {
  return labels[record.title] ?? {
    organisation: record.issuer,
    recognition: record.title,
  };
}
