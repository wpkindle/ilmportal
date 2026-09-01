/**
 * Comprehensive Master Directory of All Pakistani Cities across all provinces
 * (Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad ICT, AJK, Gilgit-Baltistan)
 */

export const allPakistaniCities = [
  // Federal Capital
  'Islamabad',

  // Punjab Major Cities & Districts
  'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 'Bahawalpur', 'Sargodha',
  'Sialkot', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat', 'Sahiwal', 'Wah Cantt',
  'Kasur', 'Okara', 'Dera Ghazi Khan', 'Chiniot', 'Kamoke', 'Mandi Bahauddin', 'Jhelum',
  'Sadiqabad', 'Khanewal', 'Hafizabad', 'Muzaffargarh', 'Khanpur', 'Gojra', 'Bahawalnagar',
  'Muridke', 'Pakpattan', 'Toba Tek Singh', 'Vehari', 'Kot Addu', 'Wazirabad', 'Chakwal',
  'Mianwali', 'Attock', 'Lodhran', 'Bhakkar', 'Layyah', 'Khushab', 'Narowal', 'Rajanpur',
  'Taxila', 'Murree', 'Burewala', 'Chichawatni', 'Daska', 'Kamalia', 'Pattoki', 'Shorkot',
  'Taunsa Sharif', 'Kot Radha Kishan', 'Haroonabad', 'Jaranwala', 'Sambrial', 'Mailsi',
  'Jalalpur Jattan', 'Ahmedpur East', 'Dinga', 'Kharian', 'Mian Channu', 'Dunya Pur',

  // Sindh Major Cities & Districts
  'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah (Shaheed Benazirabad)', 'Mirpur Khas',
  'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu', 'Tando Adam', 'Tando Allahyar', 'Thatta',
  'Badin', 'Ghotki', 'Umerkot', 'Kotri', 'Kashmore', 'Sanghar', 'Kandhkot', 'Shahdadkot',
  'Matiari', 'Jamshoro', 'Moro', 'Ratodero', 'Rohri', 'Mehrabpur', 'Sehwan', 'Mirpur Mathelo',
  'Khipro', 'Digri', 'Naukot', 'Pano Akil', 'Naushahro Feroze', 'Daharki',

  // Khyber Pakhtunkhwa (KP) Major Cities & Districts
  'Peshawar', 'Mardan', 'Abbottabad', 'Mingora (Swat)', 'Kohat', 'Dera Ismail Khan',
  'Bannu', 'Swabi', 'Charsadda', 'Nowshera', 'Mansehra', 'Haripur', 'Batkhela', 'Karak',
  'Hangu', 'Timergara (Dir)', 'Chitral', 'Parachinar', 'Tank', 'Upper Dir', 'Lower Dir',
  'Buner', 'Shangla', 'Malakand', 'Risalpur', 'Shabqadar', 'Tangi', 'Pabbi', 'Topi',
  'Dargai', 'Kabal', 'Barikot', 'Matta', 'Khwazakhela', 'Alpuri', 'Gadoon', 'Wana', 'Miranshah',

  // Balochistan Major Cities & Districts
  'Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Chaman', 'Gwadar', 'Sibi', 'Zhob', 'Loralai',
  'Dera Murad Jamali', 'Dera Allah Yar', 'Nushki', 'Kalat', 'Kharan', 'Mastung', 'Pishin',
  'Qila Saifullah', 'Qila Abdullah', 'Panjgur', 'Usta Mohammad', 'Sohbatpur', 'Barkhan',
  'Duki', 'Harnai', 'Jaffarabad', 'Jhal Magsi', 'Kech', 'Kohlu', 'Lasbela', 'Musakhel',
  'Nasirabad', 'Surab', 'Washuk', 'Ziarat', 'Pasni', 'Ormara', 'Jiwani',

  // Azad Jammu & Kashmir (AJK)
  'Muzaffarabad', 'Mirpur (AJK)', 'Rawalakot', 'Kotli', 'Bhimber', 'Bagh', 'Pallandri',
  'Hattian Bala', 'Haveli', 'Chakswari', 'Dadyal', 'Islamgarh', 'Sehnsa',

  // Gilgit-Baltistan
  'Gilgit', 'Skardu', 'Hunza', 'Chilas', 'Diamer', 'Ghangche', 'Nagar', 'Astore', 'Ghizer',
  'Shigar', 'Kharmang', 'Aliabad', 'Karimabad', 'Gahkuch', 'Khaplu'
].sort();

// Province-based grouping for categorized selectors
export const pakistaniCitiesByProvince = {
  'Federal Capital': ['Islamabad'],
  'Punjab': [
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 'Bahawalpur', 'Sargodha',
    'Sialkot', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat', 'Sahiwal', 'Wah Cantt',
    'Kasur', 'Okara', 'Dera Ghazi Khan', 'Chiniot', 'Kamoke', 'Mandi Bahauddin', 'Jhelum',
    'Sadiqabad', 'Khanewal', 'Hafizabad', 'Muzaffargarh', 'Khanpur', 'Gojra', 'Bahawalnagar',
    'Muridke', 'Pakpattan', 'Toba Tek Singh', 'Vehari', 'Kot Addu', 'Wazirabad', 'Chakwal',
    'Mianwali', 'Attock', 'Lodhran', 'Bhakkar', 'Layyah', 'Khushab', 'Narowal', 'Rajanpur',
    'Taxila', 'Murree', 'Burewala', 'Chichawatni', 'Daska', 'Kamalia', 'Pattoki', 'Shorkot',
    'Taunsa Sharif', 'Kot Radha Kishan', 'Haroonabad', 'Jaranwala', 'Sambrial', 'Mailsi',
    'Jalalpur Jattan', 'Ahmedpur East', 'Dinga', 'Kharian', 'Mian Channu', 'Dunya Pur'
  ],
  'Sindh': [
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah (Shaheed Benazirabad)', 'Mirpur Khas',
    'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu', 'Tando Adam', 'Tando Allahyar', 'Thatta',
    'Badin', 'Ghotki', 'Umerkot', 'Kotri', 'Kashmore', 'Sanghar', 'Kandhkot', 'Shahdadkot',
    'Matiari', 'Jamshoro', 'Moro', 'Ratodero', 'Rohri', 'Mehrabpur', 'Sehwan', 'Mirpur Mathelo',
    'Khipro', 'Digri', 'Naukot', 'Pano Akil', 'Naushahro Feroze', 'Daharki'
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar', 'Mardan', 'Abbottabad', 'Mingora (Swat)', 'Kohat', 'Dera Ismail Khan',
    'Bannu', 'Swabi', 'Charsadda', 'Nowshera', 'Mansehra', 'Haripur', 'Batkhela', 'Karak',
    'Hangu', 'Timergara (Dir)', 'Chitral', 'Parachinar', 'Tank', 'Upper Dir', 'Lower Dir',
    'Buner', 'Shangla', 'Malakand', 'Risalpur', 'Shabqadar', 'Tangi', 'Pabbi', 'Topi',
    'Dargai', 'Kabal', 'Barikot', 'Matta', 'Khwazakhela', 'Alpuri', 'Gadoon', 'Wana', 'Miranshah'
  ],
  'Balochistan': [
    'Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Chaman', 'Gwadar', 'Sibi', 'Zhob', 'Loralai',
    'Dera Murad Jamali', 'Dera Allah Yar', 'Nushki', 'Kalat', 'Kharan', 'Mastung', 'Pishin',
    'Qila Saifullah', 'Qila Abdullah', 'Panjgur', 'Usta Mohammad', 'Sohbatpur', 'Barkhan',
    'Duki', 'Harnai', 'Jaffarabad', 'Jhal Magsi', 'Kech', 'Kohlu', 'Lasbela', 'Musakhel',
    'Nasirabad', 'Surab', 'Washuk', 'Ziarat', 'Pasni', 'Ormara', 'Jiwani'
  ],
  'Azad Jammu & Kashmir': [
    'Muzaffarabad', 'Mirpur (AJK)', 'Rawalakot', 'Kotli', 'Bhimber', 'Bagh', 'Pallandri',
    'Hattian Bala', 'Haveli', 'Chakswari', 'Dadyal', 'Islamgarh', 'Sehnsa'
  ],
  'Gilgit-Baltistan': [
    'Gilgit', 'Skardu', 'Hunza', 'Chilas', 'Diamer', 'Ghangche', 'Nagar', 'Astore', 'Ghizer',
    'Shigar', 'Kharmang', 'Aliabad', 'Karimabad', 'Gahkuch', 'Khaplu'
  ]
};

// Detailed neighborhood/area breakdowns for metropolitan areas
export const pakistaniCityAreas = {
  'Lahore': [
    'DHA (Phase 1-9)',
    'Gulberg (I - III)',
    'Johar Town',
    'Model Town',
    'Bahria Town Lahore',
    'Cantt & Cavalry Ground',
    'Wapda Town',
    'Allama Iqbal Town',
    'Faisal Town & Garden Town',
    'Shadman & Jail Road',
    'Valencia Town',
    'Lake City',
    'Askari (1-11)',
    'Raiwind Road',
    'Samanabad',
    'Township & Green Town'
  ],
  'Karachi': [
    'DHA (Phase 1-8)',
    'Clifton (Blocks 1-9)',
    'Gulshan-e-Iqbal',
    'North Nazimabad',
    'PECHS (Blocks 1-6)',
    'Gulistan-e-Johar',
    'Bahria Town Karachi',
    'Malir Cantt',
    'Bahadurabad & Tariq Road',
    'KDA Scheme 1',
    'Federal B Area',
    'Saddar & Cantt',
    'Nazimabad',
    'North Karachi'
  ],
  'Islamabad': [
    'F-6 / F-7 / F-8',
    'F-10 / F-11',
    'G-6 / G-7 / G-8 / G-9',
    'G-10 / G-11 / G-13',
    'E-7 / E-11',
    'DHA Islamabad (Phase 1-5)',
    'Bahria Town (Phase 1-8)',
    'I-8 / I-9 / I-10',
    'Chak Shahzad & Park Road',
    'PWD & Media Town',
    'Bani Gala',
    'Gulberg Greens'
  ],
  'Rawalpindi': [
    'Saddar & Cantt',
    'Satellite Town',
    'Westridge (1-3)',
    'Bahria Town Rawalpindi',
    'Chaklala Scheme 3',
    'Askari (7, 13, 14)',
    'Commercial Market',
    'Gulraiz Housing Scheme',
    'Adyala Road',
    'Peshawar Road'
  ],
  'Peshawar': [
    'Hayatabad (Phase 1-7)',
    'University Town',
    'Peshawar Cantt',
    'Warsak Road',
    'Gulbahar',
    'Saddar',
    'Regi Model Town',
    'Ring Road',
    'Dalazak Road'
  ],
  'Faisalabad': [
    'D Ground',
    'Peoples Colony (1 & 2)',
    'Madina Town',
    'Kohinoor City',
    'Canal Road & Wapda City',
    'Civil Lines',
    'Samanabad',
    'Gulberg'
  ],
  'Multan': [
    'Cantt & Officers Colony',
    'Gulgasht Colony',
    'Bosan Road',
    'Model Town Multan',
    'Wapda Town Multan',
    'Shah Rukn-e-Alam Colony',
    'New Multan'
  ],
  'Hyderabad': [
    'Latifabad (Units 1-12)',
    'Qasimabad',
    'Cantt & Saddar',
    'Citizen Colony',
    'Auto Bhan Road',
    'Gulistan-e-Sajjad'
  ],
  'Quetta': [
    'Cantt & Staff College',
    'Jinnah Town',
    'Shahbaz Town',
    'Model Town',
    'Samungli Road',
    'Zarghoon Road'
  ],
  'Abbottabad': [
    'Mandian',
    'Jadoon Plaza / Phase 1-2',
    'Cantt & PMA Road',
    'Supply & Link Road',
    'Nawanshehr'
  ],
  'Sialkot': [
    'Cantt & Model Town',
    'Paris Road',
    'Kashmir Road',
    'Sialkot Smart City',
    'Citi Housing Sialkot'
  ],
  'Gujranwala': [
    'DC Colony',
    'Cantt & Rahwali',
    'Model Town',
    'Wapda Town',
    'Master City',
    'Citi Housing Gujranwala'
  ]
};
