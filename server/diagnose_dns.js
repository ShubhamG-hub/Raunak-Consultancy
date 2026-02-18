const dns = require('dns');

const hosts = ['google.com', 'yjjqrwrlewmotmskxjgo.supabase.co'];

hosts.forEach(hostname => {
    console.log(`\n--- Checking DNS for ${hostname} ---`);
    dns.lookup(hostname, (err, address, family) => {
        if (err) {
            console.error(`dns.lookup ${hostname} failed:`, err);
        } else {
            console.log(`dns.lookup ${hostname} address:`, address, 'family:', family);
        }
    });

    dns.resolve4(hostname, (err, addresses) => {
        if (err) {
            console.error(`dns.resolve4 ${hostname} failed:`, err);
        } else {
            console.log(`dns.resolve4 ${hostname} addresses:`, addresses);
        }
    });
});

setTimeout(() => {
    console.log('\n--- Testing fetch for google.com ---');
    fetch('https://google.com')
        .then(res => console.log('Google fetch status:', res.status))
        .catch(err => console.error('Google fetch failed:', err));

    console.log('\n--- Testing fetch for Supabase ---');
    fetch('https://yjjqrwrlewmotmskxjgo.supabase.co')
        .then(res => console.log('Supabase fetch status:', res.status))
        .catch(err => console.error('Supabase fetch failed:', err));
}, 1000);
