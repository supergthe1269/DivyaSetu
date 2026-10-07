export type Region = 'South' | 'North' | 'West' | 'East' | 'Central' | 'Northeast';

export interface LocationNode {
  name: string;
  district: string;
  state: string;
  region: Region;
  lat: number;
  lng: number;
}

export const REGIONS: { key: Region; label: string }[] = [
  { key: 'South', label: 'South India' },
  { key: 'North', label: 'North India' },
  { key: 'West', label: 'West India' },
  { key: 'East', label: 'East India' },
  { key: 'Central', label: 'Central India' },
  { key: 'Northeast', label: 'Northeast India' },
];

export const ALL_INDIA_LOCATIONS: LocationNode[] = [
  // --- SOUTH INDIA ---
  { name: 'Chennai — Central', district: 'Chennai', state: 'Tamil Nadu', region: 'South', lat: 13.0827, lng: 80.2707 },
  { name: 'Chennai — Vadapalani', district: 'Chennai', state: 'Tamil Nadu', region: 'South', lat: 13.0589, lng: 80.1839 },
  { name: 'Chennai — Mylapore', district: 'Chennai', state: 'Tamil Nadu', region: 'South', lat: 13.0029, lng: 80.2404 },
  { name: 'Chennai — Ambattur', district: 'Tiruvallur', state: 'Tamil Nadu', region: 'South', lat: 13.0981, lng: 80.1476 },
  { name: 'Chennai — Tambaram', district: 'Chengalpattu', state: 'Tamil Nadu', region: 'South', lat: 12.9249, lng: 80.1000 },
  { name: 'Coimbatore Hub', district: 'Coimbatore', state: 'Tamil Nadu', region: 'South', lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai Central', district: 'Madurai', state: 'Tamil Nadu', region: 'South', lat: 9.9256, lng: 78.1198 },
  { name: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', region: 'South', lat: 10.7905, lng: 78.7047 },
  { name: 'Salem', district: 'Salem', state: 'Tamil Nadu', region: 'South', lat: 11.6643, lng: 78.1460 },
  { name: 'Bengaluru — Central', district: 'Bengaluru Urban', state: 'Karnataka', region: 'South', lat: 12.9716, lng: 77.5946 },
  { name: 'Bengaluru — Whitefield', district: 'Bengaluru Urban', state: 'Karnataka', region: 'South', lat: 12.9698, lng: 77.7500 },
  { name: 'Mysuru', district: 'Mysuru', state: 'Karnataka', region: 'South', lat: 12.2958, lng: 76.6394 },
  { name: 'Mangaluru', district: 'Dakshina Kannada', state: 'Karnataka', region: 'South', lat: 12.9141, lng: 74.8560 },
  { name: 'Hyderabad — Central', district: 'Hyderabad', state: 'Telangana', region: 'South', lat: 17.3850, lng: 78.4867 },
  { name: 'Hyderabad — Hitec City', district: 'Hyderabad', state: 'Telangana', region: 'South', lat: 17.4435, lng: 78.3772 },
  { name: 'Warangal', district: 'Hanamkonda', state: 'Telangana', region: 'South', lat: 17.9689, lng: 79.5941 },
  { name: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', region: 'South', lat: 17.6868, lng: 83.2185 },
  { name: 'Vijayawada', district: 'NTR', state: 'Andhra Pradesh', region: 'South', lat: 16.5062, lng: 80.6480 },
  { name: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', region: 'South', lat: 13.6288, lng: 79.4192 },
  { name: 'Kochi / Ernakulam', district: 'Ernakulam', state: 'Kerala', region: 'South', lat: 9.9312, lng: 76.2673 },
  { name: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', region: 'South', lat: 8.5241, lng: 76.9366 },
  { name: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', region: 'South', lat: 11.2588, lng: 75.7804 },

  // --- NORTH INDIA ---
  { name: 'New Delhi — Connaught Place', district: 'New Delhi', state: 'Delhi', region: 'North', lat: 28.6315, lng: 77.2167 },
  { name: 'New Delhi — Rohini', district: 'North West Delhi', state: 'Delhi', region: 'North', lat: 28.7495, lng: 77.0565 },
  { name: 'Noida Hub', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', region: 'North', lat: 28.5355, lng: 77.3910 },
  { name: 'Gurugram Cyber City', district: 'Gurugram', state: 'Haryana', region: 'North', lat: 28.4595, lng: 77.0266 },
  { name: 'Faridabad', district: 'Faridabad', state: 'Haryana', region: 'North', lat: 28.4089, lng: 77.3178 },
  { name: 'Chandigarh Central', district: 'Chandigarh', state: 'Chandigarh', region: 'North', lat: 30.7333, lng: 76.7794 },
  { name: 'Amritsar', district: 'Amritsar', state: 'Punjab', region: 'North', lat: 31.6340, lng: 74.8723 },
  { name: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', region: 'North', lat: 30.9010, lng: 75.8573 },
  { name: 'Lucknow — Hazratganj', district: 'Lucknow', state: 'Uttar Pradesh', region: 'North', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', district: 'Kanpur Nagar', state: 'Uttar Pradesh', region: 'North', lat: 26.4499, lng: 80.3319 },
  { name: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', region: 'North', lat: 25.3176, lng: 82.9739 },
  { name: 'Agra', district: 'Agra', state: 'Uttar Pradesh', region: 'North', lat: 27.1767, lng: 78.0081 },
  { name: 'Prayagraj', district: 'Prayagraj', state: 'Uttar Pradesh', region: 'North', lat: 25.4358, lng: 81.8463 },
  { name: 'Jaipur — Pink City', district: 'Jaipur', state: 'Rajasthan', region: 'North', lat: 26.9124, lng: 75.7873 },
  { name: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan', region: 'North', lat: 26.2389, lng: 73.0243 },
  { name: 'Udaipur', district: 'Udaipur', state: 'Rajasthan', region: 'North', lat: 24.5854, lng: 73.7125 },
  { name: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand', region: 'North', lat: 30.3165, lng: 78.0322 },
  { name: 'Shimla', district: 'Shimla', state: 'Himachal Pradesh', region: 'North', lat: 31.1048, lng: 77.1734 },
  { name: 'Srinagar', district: 'Srinagar', state: 'Jammu and Kashmir', region: 'North', lat: 34.0837, lng: 74.7973 },
  { name: 'Jammu', district: 'Jammu', state: 'Jammu and Kashmir', region: 'North', lat: 32.7266, lng: 74.8570 },

  // --- WEST INDIA ---
  { name: 'Mumbai — South / Colaba', district: 'Mumbai City', state: 'Maharashtra', region: 'West', lat: 18.9220, lng: 72.8347 },
  { name: 'Mumbai — Andheri', district: 'Mumbai Suburban', state: 'Maharashtra', region: 'West', lat: 19.1136, lng: 72.8697 },
  { name: 'Navi Mumbai Hub', district: 'Thane', state: 'Maharashtra', region: 'West', lat: 19.0330, lng: 73.0297 },
  { name: 'Pune — Shivajinagar', district: 'Pune', state: 'Maharashtra', region: 'West', lat: 18.5204, lng: 73.8567 },
  { name: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', region: 'West', lat: 21.1458, lng: 79.0882 },
  { name: 'Nashik', district: 'Nashik', state: 'Maharashtra', region: 'West', lat: 19.9975, lng: 73.7898 },
  { name: 'Chhatrapati Sambhajinagar', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', region: 'West', lat: 19.8762, lng: 75.3433 },
  { name: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', region: 'West', lat: 23.0225, lng: 72.5714 },
  { name: 'Surat', district: 'Surat', state: 'Gujarat', region: 'West', lat: 21.1702, lng: 72.8311 },
  { name: 'Vadodara', district: 'Vadodara', state: 'Gujarat', region: 'West', lat: 22.3072, lng: 73.1812 },
  { name: 'Rajkot', district: 'Rajkot', state: 'Gujarat', region: 'West', lat: 22.3039, lng: 70.8022 },
  { name: 'Goa — Panaji', district: 'North Goa', state: 'Goa', region: 'West', lat: 15.4909, lng: 73.8278 },

  // --- EAST INDIA ---
  { name: 'Kolkata — Central', district: 'Kolkata', state: 'West Bengal', region: 'East', lat: 22.5726, lng: 88.3639 },
  { name: 'Kolkata — Salt Lake', district: 'North 24 Parganas', state: 'West Bengal', region: 'East', lat: 22.5867, lng: 88.4178 },
  { name: 'Howrah', district: 'Howrah', state: 'West Bengal', region: 'East', lat: 22.5958, lng: 88.2636 },
  { name: 'Siliguri', district: 'Darjeeling', state: 'West Bengal', region: 'East', lat: 26.7271, lng: 88.3953 },
  { name: 'Bhubaneswar', district: 'Khurda', state: 'Odisha', region: 'East', lat: 20.2961, lng: 85.8245 },
  { name: 'Cuttack', district: 'Cuttack', state: 'Odisha', region: 'East', lat: 20.4625, lng: 85.8830 },
  { name: 'Rourkela', district: 'Sundargarh', state: 'Odisha', region: 'East', lat: 22.2604, lng: 84.8536 },
  { name: 'Patna', district: 'Patna', state: 'Bihar', region: 'East', lat: 25.5941, lng: 85.1376 },
  { name: 'Gaya', district: 'Gaya', state: 'Bihar', region: 'East', lat: 24.7914, lng: 85.0002 },
  { name: 'Ranchi', district: 'Ranchi', state: 'Jharkhand', region: 'East', lat: 23.3441, lng: 85.3096 },
  { name: 'Jamshedpur', district: 'East Singhbhum', state: 'Jharkhand', region: 'East', lat: 22.8046, lng: 86.2029 },

  // --- CENTRAL INDIA ---
  { name: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', region: 'Central', lat: 23.2599, lng: 77.4126 },
  { name: 'Indore', district: 'Indore', state: 'Madhya Pradesh', region: 'Central', lat: 22.7196, lng: 75.8577 },
  { name: 'Jabalpur', district: 'Jabalpur', state: 'Madhya Pradesh', region: 'Central', lat: 23.1815, lng: 79.9864 },
  { name: 'Gwalior', district: 'Gwalior', state: 'Madhya Pradesh', region: 'Central', lat: 26.2183, lng: 78.1828 },
  { name: 'Raipur', district: 'Raipur', state: 'Chhattisgarh', region: 'Central', lat: 21.2514, lng: 81.6296 },
  { name: 'Bilaspur', district: 'Bilaspur', state: 'Chhattisgarh', region: 'Central', lat: 22.0797, lng: 82.1409 },

  // --- NORTHEAST INDIA ---
  { name: 'Guwahati', district: 'Kamrup Metropolitan', state: 'Assam', region: 'Northeast', lat: 26.1445, lng: 91.7362 },
  { name: 'Silchar', district: 'Cachar', state: 'Assam', region: 'Northeast', lat: 24.8333, lng: 92.7789 },
  { name: 'Shillong', district: 'East Khasi Hills', state: 'Meghalaya', region: 'Northeast', lat: 25.5788, lng: 91.8933 },
  { name: 'Agartala', district: 'West Tripura', state: 'Tripura', region: 'Northeast', lat: 23.8315, lng: 91.2868 },
  { name: 'Imphal', district: 'Imphal West', state: 'Manipur', region: 'Northeast', lat: 24.8170, lng: 93.9368 },
  { name: 'Aizawl', district: 'Aizawl', state: 'Mizoram', region: 'Northeast', lat: 23.7271, lng: 92.7176 },
  { name: 'Dimapur', district: 'Dimapur', state: 'Nagaland', region: 'Northeast', lat: 25.9042, lng: 93.7267 },
  { name: 'Gangtok', district: 'East Sikkim', state: 'Sikkim', region: 'Northeast', lat: 27.3389, lng: 88.6065 },
  { name: 'Itanagar', district: 'Papum Pare', state: 'Arunachal Pradesh', region: 'Northeast', lat: 27.0844, lng: 93.6053 },
];

export const LOCATIONS_BY_REGION: Record<Region, LocationNode[]> = REGIONS.reduce((acc, { key }) => {
  acc[key] = ALL_INDIA_LOCATIONS.filter((loc) => loc.region === key);
  return acc;
}, {} as Record<Region, LocationNode[]>);

export const DEFAULT_LOCATION: LocationNode = ALL_INDIA_LOCATIONS[0];
