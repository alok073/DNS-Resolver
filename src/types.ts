import { ClassValues, QClassValues, QTypeValues, TypeValues } from './enum';

interface IDnsHeader {
  /**
   * A 16 bit transaction ID
   *
   * @type {number}
   */
  id: number;

  /**
   * A one bit field that specifies whether this message is a query (0), or a response (1)
   *
   * @type {number}
   */
  qr: number;

  /**
   * A 4 bit field that specifies the kind of query in this message.
   * - `0`: a standard query (QUERY)
   * - `1`: an inverse query (IQUERY)
   * - `2`: a server status request (STATUS)
   * - `3-15`: reserved for future use
   *
   * @type {number}
   */
  opcode: number;

  /**
   * Authoritative Answer - one bit.
   * this bit is valid in responses, and specifies that the responding name server is an authority for the domain name in question section.
   *
   * @type {number}
   */
  aa: number;

  /**
   * TrunCation - one bit.
   * specifies that this message was truncated due to length greater than that permitted on the transmission channel.
   *
   * @type {number}
   */
  tc: number;

  /**
   * Recursion Desired - one bit.
   * If RD is set, it directs the name server to pursue the query recursively. Recursive query support is optional.
   *
   * @type {number}
   */
  rd: number;

  /**
   * Recursion Available - one bit.
   * denotes whether recursive query support is available in the name server.
   *
   * @type {number}
   */
  ra: number;

  /**
   * Reserved for future use.
   * Must be zero in all queries and responses.
   * 3 bits
   *
   * @type {number}
   */
  z: number;

  /**
   * Response code - 4 bit field
   * - `0`: No error condition
   * - `1`: Format error
   * - `2`: Server failure
   * - `3`: Name Error
   * - `4`: Not Implemented
   * - `5`: Refused
   * - `6-15`: Reserved for future use
   *
   * @type {number}
   */
  rCode: number;

  /**
   * Number of entries in the question section.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  qdCount: number;

  /**
   * Number of resource records in the answer section.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  anCount: number;

  /**
   * Number of name server resource records in the authority records section.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  nsCount: number;

  /**
   * Number of resource records in the additional records section.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  arCount: number;
}

interface IQuestion {
  /**
   * Domain name represented as a sequence of labels.
   * Each label consists of a length octet followed by that number of octets.
   * The domain name terminates with a zero length octet.
   * May have and odd number of octets. No padding is used.
   *
   * @type {string}
   */
  name: string;

  /**
   * A two octet code - specifies the type of query.
   *
   * @type {number}
   */
  type: TypeValues | QTypeValues;

  /**
   * A two octet code - specifies the class of the query.
   *
   * @type {number}
   */
  class: ClassValues | QClassValues;
}

interface IResourceRecord {
  /**
   * Domain name.
   *
   * @type {string}
   */
  name: string;

  /**
   * Type of Resource Record.
   * 16 bit integer.
   *
   * @type {TypeValues}
   */
  type: TypeValues;

  /**
   * Class of the data present in this RR.
   * 16 bit integer.
   *
   * @type {ClassValues}
   */
  class: ClassValues;

  /**
   * Time interval (in seconds) that the RR may be cached,
   * before it should be discarded.
   * TTL - Time to Live
   * A 32 bit unsigned integer.
   *
   * @type {number}
   */
  ttl: number;

  /**
   * Length in octets of the data field.
   * An unsigned 16 bit integer.
   *
   * @type {number}
   */
  dataLength: number;

  /**
   * Variable length string of octets that describes the record.
   *
   * @type {string}
   */
  data: string;
}

/**
 * Refer to https://datatracker.ietf.org/doc/html/rfc1035#section-4
 */
interface IDnsMessage {
  header: IDnsHeader;
  questions: IQuestion[];
  answers: IResourceRecord[];
  authority: IResourceRecord[];
  additional: IResourceRecord[];
  toByteString(): string;
}

/**
 * A message parser interface that takes a Buffer as an argument.
 */
interface IDnsMessageParser {
  /**
   * Parse the Buffer into a valid IDnsMessage
   *
   * @returns {IDnsMessage}
   */
  parse(): IDnsMessage;
}

/**
 * This interface is used to find DNS records for the given domain.
 * The server is defined using host and port.
 */
interface IDnsQuery {
  /**
   * The domain for which the DNS query is being made.
   *
   * @type {string}
   */
  domain: string;

  /**
   * The host of the server.
   *
   * @type {string}
   */
  host: string;

  /**
   * The port of the server.
   *
   * @type {number}
   */
  port: number;

  /**
   * If true, then logs the Data packets in hex format.
   *
   * @type {boolean}
   */
  debug: boolean;

  /**
   * Send the DNS query message to the server.
   * You can override the header by passing the required field in the params.
   *
   * @param {?Partial<IDnsHeader>} [header]
   * @returns {Promise<IDnsMessage>}
   */
  sendMessage(header?: Partial<IDnsHeader>): Promise<IDnsMessage>;
}

interface ICommandWaitingForReply {
  resolve(reply?: IDnsMessage | PromiseLike<IDnsMessage>): void;
  reject(reply?: unknown): void;
  request: IDnsMessage;
}

/**
 * This interface is used with the DnsMessage class to accept the args.
 * All the arguments are optional.
 * The header argument has Partial capabilities.
 */
interface DnsMessageArgs {
    header?: Partial<IDnsHeader>;
    questions?: IQuestion[];
    answers?: IResourceRecord[];
    authority?: IResourceRecord[];
    additional?: IResourceRecord[];
  }

export {
  IDnsHeader,
  IDnsMessage,
  IDnsMessageParser,
  IQuestion,
  IDnsQuery,
  ICommandWaitingForReply,
  IResourceRecord,
  DnsMessageArgs
};
