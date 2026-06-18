-- ============================================
-- 014: Master Medicine Catalog
-- Pre-loaded medicine database for stores to pick from
-- ============================================

CREATE TABLE IF NOT EXISTS medicine_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  manufacturer text NOT NULL,
  category text NOT NULL,
  description text,
  dosage_form text,
  strength text,
  pack_size text,
  mrp numeric(10,2) NOT NULL DEFAULT 0,
  requires_prescription boolean DEFAULT false,
  uses jsonb DEFAULT '[]'::jsonb,
  side_effects jsonb DEFAULT '[]'::jsonb,
  image text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE medicine_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read catalog" ON medicine_catalog FOR SELECT USING (true);

-- ============================================
-- Seed: Common Indian medicines (~80 items)
-- ============================================
INSERT INTO medicine_catalog (name, manufacturer, category, description, dosage_form, strength, pack_size, mrp, requires_prescription, uses, side_effects) VALUES

-- === TABLETS - Pain / Fever ===
('Dolo 650', 'Micro Labs', 'Tablets', 'Paracetamol tablet for fever and mild to moderate pain relief', 'Tablet', '650mg', '15 tablets', 32, false,
 '["Fever","Headache","Body pain","Toothache"]'::jsonb, '["Nausea","Allergic reaction (rare)"]'::jsonb),

('Crocin Advance', 'GSK', 'Tablets', 'Fast-acting paracetamol for fever and pain', 'Tablet', '500mg', '15 tablets', 28, false,
 '["Fever","Headache","Cold","Body ache"]'::jsonb, '["Stomach upset","Allergic reaction (rare)"]'::jsonb),

('Combiflam', 'Sanofi', 'Tablets', 'Ibuprofen + Paracetamol combination for pain and inflammation', 'Tablet', '400mg+325mg', '20 tablets', 42, false,
 '["Headache","Toothache","Joint pain","Menstrual cramps","Fever"]'::jsonb, '["Stomach pain","Nausea","Dizziness"]'::jsonb),

('Disprin', 'Reckitt', 'Tablets', 'Aspirin for headache and body pain', 'Tablet', '350mg', '10 tablets', 18, false,
 '["Headache","Fever","Body pain"]'::jsonb, '["Stomach irritation","Nausea"]'::jsonb),

('Saridon', 'Bayer', 'Tablets', 'Triple-action formula for headache', 'Tablet', '250mg+150mg+50mg', '10 tablets', 36, false,
 '["Headache","Migraine","Toothache"]'::jsonb, '["Drowsiness","Stomach upset"]'::jsonb),

-- === TABLETS - Antibiotics ===
('Azithral 500', 'Alembic', 'Tablets', 'Azithromycin antibiotic for bacterial infections', 'Tablet', '500mg', '3 tablets', 95, true,
 '["Throat infection","Respiratory infection","Skin infection","Ear infection"]'::jsonb, '["Nausea","Diarrhea","Stomach pain"]'::jsonb),

('Augmentin 625', 'GSK', 'Tablets', 'Amoxicillin + Clavulanic acid broad-spectrum antibiotic', 'Tablet', '625mg', '10 tablets', 220, true,
 '["Urinary tract infection","Respiratory infection","Skin infection","Dental infection"]'::jsonb, '["Diarrhea","Nausea","Skin rash"]'::jsonb),

('Cefixime 200', 'Cipla', 'Tablets', 'Cephalosporin antibiotic for infections', 'Tablet', '200mg', '10 tablets', 155, true,
 '["Urinary infection","Throat infection","Pneumonia","Typhoid"]'::jsonb, '["Diarrhea","Stomach pain","Nausea"]'::jsonb),

('Amoxicillin 500', 'Cipla', 'Capsules', 'Broad-spectrum penicillin antibiotic', 'Capsule', '500mg', '10 capsules', 65, true,
 '["Throat infection","Ear infection","Dental infection","Urinary infection"]'::jsonb, '["Diarrhea","Nausea","Allergic reaction"]'::jsonb),

('Metronidazole 400', 'Abbott', 'Tablets', 'Antibiotic for anaerobic bacterial and parasitic infections', 'Tablet', '400mg', '15 tablets', 28, true,
 '["Dental infection","Stomach infection","Giardiasis","Amoebiasis"]'::jsonb, '["Metallic taste","Nausea","Dark urine"]'::jsonb),

-- === TABLETS - Gastric / Acidity ===
('Pan 40', 'Alkem', 'Tablets', 'Pantoprazole for acidity and gastric ulcers', 'Tablet', '40mg', '15 tablets', 110, false,
 '["Acidity","Gastric ulcer","GERD","Heartburn"]'::jsonb, '["Headache","Diarrhea","Stomach pain"]'::jsonb),

('Omez 20', 'Dr. Reddy''s', 'Capsules', 'Omeprazole for acid reflux and peptic ulcers', 'Capsule', '20mg', '15 capsules', 75, false,
 '["Acidity","GERD","Peptic ulcer","Heartburn"]'::jsonb, '["Headache","Nausea","Flatulence"]'::jsonb),

('Rantac 150', 'JB Chemicals', 'Tablets', 'Ranitidine for acid reflux and ulcers', 'Tablet', '150mg', '30 tablets', 40, false,
 '["Acidity","Stomach ulcer","Heartburn","Indigestion"]'::jsonb, '["Headache","Constipation","Diarrhea"]'::jsonb),

('Gelusil MPS', 'Pfizer', 'Tablets', 'Antacid for quick relief from acidity', 'Tablet', 'MPS', '20 tablets', 58, false,
 '["Acidity","Gas","Bloating","Indigestion"]'::jsonb, '["Constipation","Diarrhea"]'::jsonb),

('Digene', 'Abbott', 'Tablets', 'Antacid + anti-gas tablet', 'Tablet', 'Gel', '15 tablets', 42, false,
 '["Acidity","Gas","Bloating","Heartburn"]'::jsonb, '["Constipation"]'::jsonb),

-- === TABLETS - Allergy / Cold ===
('Cetirizine 10mg', 'Cipla', 'Tablets', 'Antihistamine for allergies', 'Tablet', '10mg', '10 tablets', 22, false,
 '["Allergic rhinitis","Sneezing","Itching","Urticaria","Hay fever"]'::jsonb, '["Drowsiness","Dry mouth","Fatigue"]'::jsonb),

('Allegra 120', 'Sanofi', 'Tablets', 'Non-drowsy antihistamine for allergies', 'Tablet', '120mg', '10 tablets', 145, false,
 '["Allergic rhinitis","Sneezing","Itchy eyes","Hives"]'::jsonb, '["Headache","Nausea","Dizziness"]'::jsonb),

('Montair LC', 'Cipla', 'Tablets', 'Montelukast + Levocetirizine for allergies and asthma', 'Tablet', '10mg+5mg', '15 tablets', 185, true,
 '["Allergic rhinitis","Asthma","Seasonal allergies","Sneezing"]'::jsonb, '["Drowsiness","Headache","Dry mouth"]'::jsonb),

('Sinarest', 'Centaur', 'Tablets', 'Cold and flu tablet', 'Tablet', 'Multi', '10 tablets', 30, false,
 '["Common cold","Running nose","Sneezing","Headache","Fever"]'::jsonb, '["Drowsiness","Dry mouth"]'::jsonb),

('Cheston Cold', 'Cipla', 'Tablets', 'Combination tablet for cold symptoms', 'Tablet', 'Multi', '10 tablets', 55, false,
 '["Cold","Cough","Nasal congestion","Fever","Headache"]'::jsonb, '["Drowsiness","Nausea","Dry mouth"]'::jsonb),

-- === TABLETS - Diabetes ===
('Metformin 500', 'USV', 'Tablets', 'Oral hypoglycemic for type 2 diabetes', 'Tablet', '500mg', '20 tablets', 32, true,
 '["Type 2 diabetes","Blood sugar control"]'::jsonb, '["Nausea","Diarrhea","Stomach pain","Metallic taste"]'::jsonb),

('Glimepiride 2mg', 'Sanofi', 'Tablets', 'Sulfonylurea for type 2 diabetes', 'Tablet', '2mg', '10 tablets', 58, true,
 '["Type 2 diabetes","Blood sugar control"]'::jsonb, '["Low blood sugar","Weight gain","Nausea"]'::jsonb),

('Janumet 50/500', 'MSD', 'Tablets', 'Sitagliptin + Metformin for diabetes', 'Tablet', '50mg+500mg', '15 tablets', 550, true,
 '["Type 2 diabetes","Blood sugar control"]'::jsonb, '["Nausea","Diarrhea","Headache"]'::jsonb),

-- === TABLETS - Blood Pressure / Heart ===
('Amlodipine 5mg', 'Cipla', 'Tablets', 'Calcium channel blocker for hypertension', 'Tablet', '5mg', '15 tablets', 35, true,
 '["High blood pressure","Angina","Chest pain"]'::jsonb, '["Swelling in ankles","Headache","Dizziness"]'::jsonb),

('Telmisartan 40', 'Glenmark', 'Tablets', 'ARB for blood pressure control', 'Tablet', '40mg', '15 tablets', 85, true,
 '["High blood pressure","Heart failure prevention"]'::jsonb, '["Dizziness","Back pain","Diarrhea"]'::jsonb),

('Atorvastatin 10', 'Pfizer', 'Tablets', 'Statin for cholesterol management', 'Tablet', '10mg', '15 tablets', 95, true,
 '["High cholesterol","Heart disease prevention","Stroke prevention"]'::jsonb, '["Muscle pain","Headache","Nausea"]'::jsonb),

('Ecosprin 75', 'USV', 'Tablets', 'Low-dose aspirin for heart protection', 'Tablet', '75mg', '30 tablets', 18, true,
 '["Heart attack prevention","Stroke prevention","Blood thinning"]'::jsonb, '["Stomach irritation","Easy bruising"]'::jsonb),

('Clopidogrel 75', 'Sun Pharma', 'Tablets', 'Antiplatelet for blood clot prevention', 'Tablet', '75mg', '10 tablets', 82, true,
 '["Blood clot prevention","Heart attack prevention","Stroke prevention"]'::jsonb, '["Bleeding","Bruising","Stomach pain"]'::jsonb),

-- === TABLETS - Pain / Muscle ===
('Flexon MR', 'Aristo', 'Tablets', 'Muscle relaxant + pain reliever', 'Tablet', 'Multi', '10 tablets', 68, true,
 '["Muscle spasm","Back pain","Neck pain","Joint stiffness"]'::jsonb, '["Drowsiness","Dizziness","Dry mouth"]'::jsonb),

('Voveran SR 100', 'Novartis', 'Tablets', 'Diclofenac for pain and inflammation', 'Tablet', '100mg', '10 tablets', 56, true,
 '["Joint pain","Back pain","Arthritis","Post-surgical pain"]'::jsonb, '["Stomach pain","Nausea","Dizziness"]'::jsonb),

('Brufen 400', 'Abbott', 'Tablets', 'Ibuprofen for pain and fever', 'Tablet', '400mg', '15 tablets', 30, false,
 '["Headache","Toothache","Muscle pain","Fever","Menstrual cramps"]'::jsonb, '["Stomach pain","Nausea","Heartburn"]'::jsonb),

-- === CAPSULES ===
('Becosules', 'Pfizer', 'Capsules', 'B-complex multivitamin capsule', 'Capsule', 'Multi', '20 capsules', 32, false,
 '["Vitamin B deficiency","Mouth ulcers","Weakness","Hair fall"]'::jsonb, '["Nausea (rare)","Bright yellow urine"]'::jsonb),

('Evion 400', 'Merck', 'Capsules', 'Vitamin E capsule for skin and hair', 'Capsule', '400mg', '10 capsules', 28, false,
 '["Vitamin E deficiency","Skin health","Hair health","Antioxidant"]'::jsonb, '["Nausea","Fatigue (high dose)"]'::jsonb),

('Shelcal 500', 'Elder', 'Tablets', 'Calcium + Vitamin D3 supplement', 'Tablet', '500mg+250IU', '15 tablets', 115, false,
 '["Calcium deficiency","Bone health","Osteoporosis prevention"]'::jsonb, '["Constipation","Gas"]'::jsonb),

-- === VITAMINS / SUPPLEMENTS ===
('Supradyn Daily', 'Bayer', 'Vitamins', 'Daily multivitamin and mineral supplement', 'Tablet', 'Multi', '15 tablets', 45, false,
 '["Daily nutrition","Energy boost","Immunity support","Vitamin deficiency"]'::jsonb, '["Nausea (rare)","Stomach upset"]'::jsonb),

('Revital H', 'Sun Pharma', 'Vitamins', 'Multivitamin with ginseng for energy', 'Capsule', 'Multi', '30 capsules', 320, false,
 '["Energy boost","Stamina","Daily nutrition","Immunity"]'::jsonb, '["Insomnia","Stomach upset"]'::jsonb),

('Limcee', 'Abbott', 'Vitamins', 'Vitamin C chewable tablets', 'Tablet', '500mg', '15 tablets', 25, false,
 '["Vitamin C deficiency","Immunity boost","Scurvy prevention","Antioxidant"]'::jsonb, '["Stomach upset (high dose)"]'::jsonb),

('Zincovit', 'Apex', 'Vitamins', 'Multivitamin with zinc and minerals', 'Tablet', 'Multi', '15 tablets', 78, false,
 '["Vitamin deficiency","Zinc deficiency","Immunity","General weakness"]'::jsonb, '["Nausea","Stomach upset"]'::jsonb),

('Neurobion Forte', 'Merck', 'Vitamins', 'Vitamin B1, B6, B12 for nerve health', 'Tablet', 'B1+B6+B12', '30 tablets', 38, false,
 '["Nerve weakness","Tingling sensation","Vitamin B deficiency","Neuropathy"]'::jsonb, '["Nausea (rare)"]'::jsonb),

('Calcimax Forte', 'Menarini', 'Vitamins', 'Calcium, Vitamin D3 and minerals', 'Tablet', '500mg', '30 tablets', 280, false,
 '["Calcium deficiency","Bone strength","Osteoporosis","Joint health"]'::jsonb, '["Constipation","Bloating"]'::jsonb),

-- === SYRUPS ===
('Benadryl Cough Syrup', 'Johnson & Johnson', 'Syrups', 'Cough suppressant syrup', 'Syrup', '100ml', '100ml bottle', 85, false,
 '["Dry cough","Allergic cough","Throat irritation"]'::jsonb, '["Drowsiness","Dry mouth","Dizziness"]'::jsonb),

('Grilinctus', 'Franco-Indian', 'Syrups', 'Expectorant cough syrup', 'Syrup', '100ml', '100ml bottle', 72, false,
 '["Wet cough","Chest congestion","Mucus relief"]'::jsonb, '["Drowsiness","Nausea","Stomach upset"]'::jsonb),

('Ascoril LS', 'Glenmark', 'Syrups', 'Cough syrup with expectorant and bronchodilator', 'Syrup', '100ml', '100ml bottle', 108, true,
 '["Cough with phlegm","Bronchitis","Asthma cough","Chest congestion"]'::jsonb, '["Nausea","Tremor","Palpitation"]'::jsonb),

('Honitus', 'Dabur', 'Syrups', 'Herbal cough remedy', 'Syrup', '100ml', '100ml bottle', 65, false,
 '["Cough","Sore throat","Cold","Throat irritation"]'::jsonb, '["None significant"]'::jsonb),

('Calpol Syrup', 'GSK', 'Syrups', 'Paracetamol syrup for children', 'Syrup', '60ml', '60ml bottle', 32, false,
 '["Fever in children","Pain relief in children","Teething pain"]'::jsonb, '["Nausea (rare)","Allergic reaction (rare)"]'::jsonb),

('Aristozyme', 'Aristo', 'Syrups', 'Digestive enzyme syrup', 'Syrup', '200ml', '200ml bottle', 125, false,
 '["Indigestion","Bloating","Loss of appetite","Flatulence"]'::jsonb, '["Nausea (rare)"]'::jsonb),

('Alkasol', 'Stadmed', 'Syrups', 'Urinary alkalizer', 'Syrup', '100ml', '100ml bottle', 65, false,
 '["Urinary tract infection","Burning urination","Kidney stones"]'::jsonb, '["Stomach upset","Diarrhea"]'::jsonb),

-- === DROPS ===
('Otrivin Nasal Drops', 'Novartis', 'Drops', 'Nasal decongestant drops', 'Drops', '10ml', '10ml bottle', 80, false,
 '["Nasal congestion","Blocked nose","Sinusitis","Cold"]'::jsonb, '["Nasal dryness","Sneezing","Burning sensation"]'::jsonb),

('Refresh Tears', 'Allergan', 'Drops', 'Artificial tears for dry eyes', 'Drops', '10ml', '10ml bottle', 175, false,
 '["Dry eyes","Eye strain","Contact lens dryness","Eye irritation"]'::jsonb, '["Mild stinging","Blurred vision (temporary)"]'::jsonb),

('Ciprodex Ear Drops', 'Alcon', 'Drops', 'Antibiotic ear drops for infection', 'Drops', '10ml', '10ml bottle', 145, true,
 '["Ear infection","Otitis media","Swimmer''s ear"]'::jsonb, '["Ear discomfort","Itching"]'::jsonb),

('Nasivion Nasal Drops', 'Merck', 'Drops', 'Oxymetazoline nasal decongestant', 'Drops', '10ml', '10ml bottle', 72, false,
 '["Nasal congestion","Sinusitis","Cold","Blocked nose"]'::jsonb, '["Burning sensation","Sneezing","Dryness"]'::jsonb),

('Tobramycin Eye Drops', 'Sun Pharma', 'Drops', 'Antibiotic eye drops', 'Drops', '5ml', '5ml bottle', 55, true,
 '["Eye infection","Conjunctivitis","Bacterial keratitis"]'::jsonb, '["Stinging","Itching","Blurred vision"]'::jsonb),

-- === OINTMENTS / CREAMS ===
('Betadine Ointment', 'Win-Medicare', 'Ointments', 'Antiseptic ointment for wounds', 'Ointment', '15g', '15g tube', 52, false,
 '["Wound healing","Minor cuts","Burns","Skin infection prevention"]'::jsonb, '["Skin irritation","Staining"]'::jsonb),

('Soframycin Cream', 'Sanofi', 'Ointments', 'Antibiotic cream for skin infections', 'Cream', '30g', '30g tube', 65, false,
 '["Skin infection","Minor wounds","Burns","Cuts"]'::jsonb, '["Skin irritation","Allergic reaction (rare)"]'::jsonb),

('Volini Spray', 'Sun Pharma', 'Ointments', 'Pain relief spray for muscles and joints', 'Spray', '40g', '40g spray', 120, false,
 '["Muscle pain","Joint pain","Sprain","Back pain","Sports injury"]'::jsonb, '["Skin irritation","Burning sensation"]'::jsonb),

('Moov Cream', 'Reckitt', 'Ointments', 'Fast pain relief cream', 'Cream', '50g', '50g tube', 85, false,
 '["Back pain","Muscle pain","Joint pain","Neck pain"]'::jsonb, '["Skin irritation","Redness"]'::jsonb),

('Candid Cream', 'Glenmark', 'Ointments', 'Antifungal cream', 'Cream', '15g', '15g tube', 68, false,
 '["Fungal infection","Ring worm","Athlete''s foot","Skin itching"]'::jsonb, '["Burning sensation","Redness"]'::jsonb),

('Clobetasol Cream', 'Glenmark', 'Ointments', 'Corticosteroid for skin inflammation', 'Cream', '30g', '30g tube', 95, true,
 '["Eczema","Psoriasis","Dermatitis","Skin inflammation"]'::jsonb, '["Skin thinning","Burning","Stretch marks"]'::jsonb),

('Burnol Cream', 'Dr. Morepen', 'Ointments', 'Antiseptic burn cream', 'Cream', '20g', '20g tube', 45, false,
 '["Minor burns","Cuts","Wounds","Scalds"]'::jsonb, '["Mild irritation"]'::jsonb),

('Boroline Cream', 'Boroline', 'Ointments', 'Antiseptic skin cream', 'Cream', '20g', '20g tube', 32, false,
 '["Dry skin","Cracked heels","Minor cuts","Skin care"]'::jsonb, '["None significant"]'::jsonb),

-- === INJECTIONS ===
('Monocef Injection', 'Aristo', 'Injections', 'Ceftriaxone injection for severe infections', 'Injection', '1g', '1 vial', 85, true,
 '["Severe infections","Pneumonia","Meningitis","Surgical prophylaxis"]'::jsonb, '["Pain at injection site","Diarrhea","Rash"]'::jsonb),

('Voveron Injection', 'Novartis', 'Injections', 'Diclofenac injection for acute pain', 'Injection', '75mg/3ml', '1 ampoule', 15, true,
 '["Severe pain","Post-operative pain","Renal colic","Acute pain"]'::jsonb, '["Pain at site","Nausea","Dizziness"]'::jsonb),

('Ondansetron Injection', 'Cipla', 'Injections', 'Anti-nausea injection', 'Injection', '4mg/2ml', '1 ampoule', 22, true,
 '["Nausea","Vomiting","Post-operative nausea","Chemotherapy nausea"]'::jsonb, '["Headache","Constipation"]'::jsonb),

-- === AYURVEDIC ===
('Chyawanprash', 'Dabur', 'Ayurvedic', 'Traditional immunity-boosting herbal supplement', 'Paste', '500g', '500g jar', 210, false,
 '["Immunity boost","Cold prevention","General wellness","Energy"]'::jsonb, '["None significant"]'::jsonb),

('Ashwagandha Tablets', 'Himalaya', 'Ayurvedic', 'Stress relief and energy booster', 'Tablet', '250mg', '60 tablets', 195, false,
 '["Stress relief","Anxiety","Energy boost","Sleep improvement","Stamina"]'::jsonb, '["Stomach upset","Drowsiness"]'::jsonb),

('Liv.52', 'Himalaya', 'Ayurvedic', 'Herbal liver protection supplement', 'Tablet', 'Multi', '100 tablets', 115, false,
 '["Liver protection","Digestion","Appetite improvement","Liver detox"]'::jsonb, '["Mild stomach upset"]'::jsonb),

('Triphala Tablets', 'Dabur', 'Ayurvedic', 'Traditional digestive and detox supplement', 'Tablet', '500mg', '60 tablets', 85, false,
 '["Constipation","Digestion","Detox","Bowel regularity"]'::jsonb, '["Loose stools","Stomach cramps"]'::jsonb),

('Tulsi Drops', 'Organic India', 'Ayurvedic', 'Holy basil extract for immunity', 'Drops', '30ml', '30ml bottle', 145, false,
 '["Immunity","Cold","Cough","Respiratory health","Stress relief"]'::jsonb, '["None significant"]'::jsonb),

('Isabgol', 'Sat-Isabgol', 'Ayurvedic', 'Psyllium husk for digestive health', 'Powder', '200g', '200g pack', 90, false,
 '["Constipation","IBS","Diarrhea","Cholesterol management"]'::jsonb, '["Bloating","Gas"]'::jsonb),

-- === OTC / General ===
('ORS Powder', 'WHO formula', 'Tablets', 'Oral rehydration salts', 'Powder', '21.8g', '10 sachets', 30, false,
 '["Dehydration","Diarrhea","Vomiting","Heat stroke"]'::jsonb, '["Nausea (rare)"]'::jsonb),

('Strepsils', 'Reckitt', 'Tablets', 'Sore throat lozenges', 'Lozenge', 'Multi', '8 lozenges', 42, false,
 '["Sore throat","Throat irritation","Cough"]'::jsonb, '["None significant"]'::jsonb),

('Vicks VapoRub', 'P&G', 'Ointments', 'Topical cough suppressant and decongestant', 'Ointment', '50ml', '50ml jar', 145, false,
 '["Nasal congestion","Cough","Cold","Muscle aches"]'::jsonb, '["Skin irritation (rare)"]'::jsonb),

('Eno Fruit Salt', 'GSK', 'Tablets', 'Antacid effervescent powder for acidity', 'Powder', '5g', '30 sachets', 90, false,
 '["Acidity","Indigestion","Gas","Heartburn"]'::jsonb, '["Bloating","Burping"]'::jsonb),

('Band-Aid (Assorted)', 'Johnson & Johnson', 'Ointments', 'Adhesive bandages for minor wounds', 'Other', 'Assorted', '25 pieces', 65, false,
 '["Minor cuts","Wounds","Blisters","Scrapes"]'::jsonb, '["Skin irritation (rare)"]'::jsonb),

('Dettol Antiseptic', 'Reckitt', 'Syrups', 'Antiseptic disinfectant liquid', 'Liquid', '250ml', '250ml bottle', 85, false,
 '["Wound cleaning","First aid","Bathing antiseptic","Surface disinfection"]'::jsonb, '["Skin irritation if undiluted"]'::jsonb),

('Savlon Antiseptic', 'ITC', 'Syrups', 'Antiseptic and disinfectant liquid', 'Liquid', '200ml', '200ml bottle', 78, false,
 '["Wound cleaning","First aid","Skin antiseptic"]'::jsonb, '["Skin dryness"]'::jsonb),

-- === Additional common medicines ===
('Pantocid DSR', 'Sun Pharma', 'Capsules', 'Pantoprazole + Domperidone for acidity and bloating', 'Capsule', '40mg+30mg', '15 capsules', 175, true,
 '["GERD","Acidity","Bloating","Nausea"]'::jsonb, '["Headache","Diarrhea","Dry mouth"]'::jsonb),

('Thyronorm 50', 'Abbott', 'Tablets', 'Levothyroxine for hypothyroidism', 'Tablet', '50mcg', '120 tablets', 135, true,
 '["Hypothyroidism","Thyroid hormone replacement"]'::jsonb, '["Palpitation","Weight loss","Insomnia"]'::jsonb),

('Duphalac Syrup', 'Abbott', 'Syrups', 'Lactulose syrup for constipation', 'Syrup', '200ml', '200ml bottle', 175, false,
 '["Constipation","Hepatic encephalopathy","Bowel regularity"]'::jsonb, '["Bloating","Flatulence","Stomach cramps"]'::jsonb),

('Deriphyllin Retard', 'Franco-Indian', 'Tablets', 'Bronchodilator for asthma and COPD', 'Tablet', '300mg', '15 tablets', 48, true,
 '["Asthma","COPD","Bronchospasm","Wheezing"]'::jsonb, '["Nausea","Palpitation","Insomnia"]'::jsonb),

('Norflox TZ', 'Cipla', 'Tablets', 'Norfloxacin + Tinidazole for stomach infections', 'Tablet', '400mg+600mg', '10 tablets', 62, true,
 '["Diarrhea","Dysentery","Stomach infection","Food poisoning"]'::jsonb, '["Nausea","Headache","Dizziness"]'::jsonb),

('Wikoryl', 'Lupin', 'Tablets', 'Cold and flu combination', 'Tablet', 'Multi', '10 tablets', 48, false,
 '["Cold","Flu","Fever","Body ache","Nasal congestion"]'::jsonb, '["Drowsiness","Dry mouth","Nausea"]'::jsonb),

('Ibugesic Plus', 'Cipla', 'Tablets', 'Ibuprofen + Paracetamol pain reliever', 'Tablet', '400mg+325mg', '10 tablets', 35, false,
 '["Headache","Fever","Body pain","Toothache","Joint pain"]'::jsonb, '["Stomach pain","Nausea"]'::jsonb),

('D-Cold Total', 'Ranbaxy', 'Tablets', 'Multi-symptom cold relief', 'Tablet', 'Multi', '10 tablets', 32, false,
 '["Cold","Nasal congestion","Headache","Body ache","Fever"]'::jsonb, '["Drowsiness","Dry mouth"]'::jsonb),

('Glycomet GP 1', 'USV', 'Tablets', 'Metformin + Glimepiride for diabetes', 'Tablet', '500mg+1mg', '15 tablets', 95, true,
 '["Type 2 diabetes","Blood sugar control"]'::jsonb, '["Hypoglycemia","Nausea","Diarrhea"]'::jsonb)

ON CONFLICT DO NOTHING;

-- Index for fast search
CREATE INDEX IF NOT EXISTS idx_medicine_catalog_name ON medicine_catalog USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_medicine_catalog_category ON medicine_catalog(category);
