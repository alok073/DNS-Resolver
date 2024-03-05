# DNS-Resolver

This project is a simple DNS resolver that is responsible for translating host part of the URL to IP address.

### Command to run :-

Use Node v18.19.0+ and install all the packages using
```
npm ci
```

Use this command to run DNS Resolver
```
npx ts-node dnsResolver.index.ts <domain>

#Input Example
npx ts-node dnsResolver.index.ts dns.google.com

#Output Example
Querying 198.41.0.4 for dns.google.com
8.8.4.4
```


### Pseudo-Code :-
1. Create a DNS message by referring the format mentioned [here](https://datatracker.ietf.org/doc/html/rfc1035#section-4.1.1)
2. Create a UDP socket connection with a root name server of your choice (for the first server I have used 198.41.0.4:53) and send the DNS message created in the above step.
3. Parse the response and check if `response.answers` field contains any response. If yes then you have received the IP address of the desired URL.
4. If not, get the IP address of the next root name server from `response.additionals.data` such that the `type` value of that server is either `A` or `NS` and the class is `IN`.
5. Keep on repeating steps 2 to 5 until you get the IP address or the server hop count exceeds the maximimum hop count (default = 10).


### References :-

1. RFC documentation : https://datatracker.ietf.org/doc/html/rfc1035#section-4.1.1
2. DNS message in-depth : https://cabulous.medium.com/dns-message-how-to-read-query-and-response-message-cfebcb4fe817
3. DNS resolver : https://cabulous.medium.com/domain-name-dns-resolution-how-it-works-bddafa0246ed