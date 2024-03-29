import DnsQuery from './dnsQuery';
import { ClassValues, TypeValues } from './enum';
import { IDnsMessage, IResourceRecord } from './types';

/**
 * This is the main DNS Resolver class.
 */
export class DnsResolver {
    private domain: string;
    private rootServer: string;
    private port: number = 53;
    private maxCount: number;
    private debug: boolean;

    constructor(
        domain: string,
        rootServer: string = '198.41.0.4',
        debug: boolean = false,
        maxCount: number = 10
    ) {
        this.domain = domain;
        this.rootServer = rootServer;
        this.maxCount = maxCount;
        this.debug = debug;
    }

    /**
     * Main entry point for DNS resolution.
     *
     * @public
     * @async
     * @returns {Promise<string>}
     */
    public async resolve(): Promise<string> {
        if (this.debug) {
            console.log('Querying %s for %s', this.rootServer, this.domain);
        }

        // First get response from root server
        let rootResponse = await this.dnsCall(this.rootServer);

        // check if root server contains the answer.
        let answer = this.checkForSolution(rootResponse);
        if (answer) {
            return answer;
        }

        // Otherwise hop to the next server
        // We perform the hop upto maxCount before throwing an Error.
        // If a solution is found in between, we will return it.
        for (let i = 0; i < this.maxCount; i++) {
            let nextServer = this.getValidNextServer(rootResponse.additional);

            const response = await this.dnsCall(nextServer);

            answer = this.checkForSolution(response);
            if (answer) {
                return answer;
            }

            rootResponse = response;
        }
        throw new Error(`Reached maximum hop count ${this.maxCount}`);
    }

    private async dnsCall(server: string): Promise<IDnsMessage> {
        const resolver = new DnsQuery(this.domain, server, this.port, false);
        return await resolver.sendMessage({ rd: 1 });
    }

    /**
     * Check if answers exists in the message.
     * Otherwise check if more information for NS records are present.
     *
     * @private
     * @param {IDnsMessage} message
     * @returns {(string | null)}
     */
    private checkForSolution(message: IDnsMessage): string | null {
        if (message.answers.length > 0) {
        return message.answers[0].data;
        }

        if (!(message.authority.length > 0 && message.additional.length > 0)) {
        throw new Error('No record found!');
        }

        return null;
    }

    /**
     * Get a valid address for the next hop from the list of additional RRs.
     * If no record found then throw an Error.
     *
     * @private
     * @param {IResourceRecord[]} additional
     * @returns {string}
     */
    private getValidNextServer(additional: IResourceRecord[]): string {
        for (let i = 0; i < additional.length; i++) {
            const rrType = additional[i].type;
            const rrClass = additional[i].class;
            // type A -> host address i.e the server that will give us the IP address of the domain that we are looking for
            // type NS -> authoritative name server. it contains a list of authoritative servers that we need to query on
            // class IN -> internet
            if (
                (rrType === TypeValues.A || rrType === TypeValues.NS) &&
                rrClass === ClassValues.IN
            ) {
                return additional[i].data;
            }
        }

        throw new Error('No valid Next Server found');
    }
}