const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const reverseGeocode = async (latitude, longitude) => {
    try {
        console.log(`Testing Nominatim: lat=${latitude}, lon=${longitude}`);
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
            headers: {
                'User-Agent': 'AntigravityEmployeeAttendanceSystem/1.0'
            }
        });
        console.log('Status code:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
        } else {
            console.log('Error text:', await response.text());
        }
    } catch (e) {
        console.error('Exception:', e);
    }
};

reverseGeocode(28.6139, 77.2090); // Delhi coordinates
