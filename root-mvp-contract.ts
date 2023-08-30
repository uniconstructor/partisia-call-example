/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import BN from "bn.js";
import {
  AbiParser,
  AbstractBuilder, BigEndianReader,
  FileAbi, FnKinds, FnRpcBuilder, RpcReader,
  ScValue,
  ScValueEnum, ScValueOption,
  ScValueStruct,
  StateReader, TypeIndex,
  BlockchainAddress,
  Hash,
  BlockchainPublicKey,
  Signature,
  BlsPublicKey,
  BlsSignature
} from "@partisiablockchain/abi-client-ts";
import { BigEndianByteOutput } from "@secata-public/bitmanipulation-ts";

const fileAbi: FileAbi = new AbiParser(Buffer.from(
  "504243414249090000050200000000080100000004557365720000000200000007757365725f6964040000000e77616c6c65745f616464726573730d010000000654656e646572000000060000000c74656e6465725f6f776e657200000000000974656e6465725f6964040000000673746174757301000000046c6f74730f0400040000000575736572730f04000300000007726573756c74730f040002010000000c54656e646572526573756c7400000003000000066c6f745f696404000000086f666665725f6964040000000a626573745f707269636504010000000a54656e64657255736572000000030000000974656e6465725f69640400000007757365725f69640400000009757365725f726f6c650101000000034c6f74000000060000000c74656e6465725f6f776e657200000000000974656e6465725f6964040000000c637269746572696f6e5f696404000000066c6f745f696404000000066f66666572730f040005000000067374617475730101000000054f66666572000000060000000c74656e6465725f6f776e657200000000000974656e6465725f696404000000066c6f745f696404000000086f666665725f6964040000000c6170706c6963616e745f6964040000000573636f726512040100000011526f6f74436f6e74726163745374617465000000030000000561646d696e0d0000000575736572730f0400000000000774656e646572730f040001010000000b536563726574566172496400000001000000067261775f69640300000007010000000a696e697469616c697a65ffffffff0f00000000020000000d72656769737465725f75736572010000000200000007757365725f6964040000000c757365725f61646472657373120d020000000d6372656174655f74656e6465720200000002000000086f776e65725f6964040000000974656e6465725f696404020000000a6372656174655f6c6f7403000000030000000974656e6465725f6964040000000c637269746572696f6e5f696404000000066c6f745f69640402000000117570646174655f6c6f745f73746174757308000000030000000974656e6465725f696404000000066c6f745f6964040000000673746174757301020000000c6372656174655f6f6666657209000000030000000974656e6465725f696404000000066c6f745f696404000000086f666665725f696404020000000d73656c6563745f77696e6e657210000000030000000974656e6465725f696404000000066c6f745f696404000000086f666665725f6964040006",
  "hex"
)).parseAbi();

type Option<K> = K | undefined;

export interface User {
  userId: BN;
  walletAddress: BlockchainAddress;
}

export function newUser(userId: BN, walletAddress: BlockchainAddress): User {
  return { userId, walletAddress }
}

function fromScValueUser(structValue: ScValueStruct): User {
  return {
    userId: structValue.getFieldValue("user_id")!.asBN(),
    walletAddress: BlockchainAddress.fromBuffer(structValue.getFieldValue("wallet_address")!.addressValue().value),
  };
}

export interface Tender {
  tenderOwner: User;
  tenderId: BN;
  status: number;
  lots: Map<BN, Lot>;
  users: Map<BN, TenderUser>;
  results: Map<BN, TenderResult>;
}

export function newTender(tenderOwner: User, tenderId: BN, status: number, lots: Map<BN, Lot>, users: Map<BN, TenderUser>, results: Map<BN, TenderResult>): Tender {
  return { tenderOwner, tenderId, status, lots, users, results }
}

function fromScValueTender(structValue: ScValueStruct): Tender {
  return {
    tenderOwner: fromScValueUser(structValue.getFieldValue("tender_owner")!.structValue()),
    tenderId: structValue.getFieldValue("tender_id")!.asBN(),
    status: structValue.getFieldValue("status")!.asNumber(),
    lots: new Map([...structValue.getFieldValue("lots")!.mapValue().map].map(([k1, v2]) => [k1.asBN(), fromScValueLot(v2.structValue())])),
    users: new Map([...structValue.getFieldValue("users")!.mapValue().map].map(([k3, v4]) => [k3.asBN(), fromScValueTenderUser(v4.structValue())])),
    results: new Map([...structValue.getFieldValue("results")!.mapValue().map].map(([k5, v6]) => [k5.asBN(), fromScValueTenderResult(v6.structValue())])),
  };
}

export interface TenderResult {
  lotId: BN;
  offerId: BN;
  bestPrice: BN;
}

export function newTenderResult(lotId: BN, offerId: BN, bestPrice: BN): TenderResult {
  return { lotId, offerId, bestPrice }
}

function fromScValueTenderResult(structValue: ScValueStruct): TenderResult {
  return {
    lotId: structValue.getFieldValue("lot_id")!.asBN(),
    offerId: structValue.getFieldValue("offer_id")!.asBN(),
    bestPrice: structValue.getFieldValue("best_price")!.asBN(),
  };
}

export interface TenderUser {
  tenderId: BN;
  userId: BN;
  userRole: number;
}

export function newTenderUser(tenderId: BN, userId: BN, userRole: number): TenderUser {
  return { tenderId, userId, userRole }
}

function fromScValueTenderUser(structValue: ScValueStruct): TenderUser {
  return {
    tenderId: structValue.getFieldValue("tender_id")!.asBN(),
    userId: structValue.getFieldValue("user_id")!.asBN(),
    userRole: structValue.getFieldValue("user_role")!.asNumber(),
  };
}

export interface Lot {
  tenderOwner: User;
  tenderId: BN;
  criterionId: BN;
  lotId: BN;
  offers: Map<BN, Offer>;
  status: number;
}

export function newLot(tenderOwner: User, tenderId: BN, criterionId: BN, lotId: BN, offers: Map<BN, Offer>, status: number): Lot {
  return { tenderOwner, tenderId, criterionId, lotId, offers, status }
}

function fromScValueLot(structValue: ScValueStruct): Lot {
  return {
    tenderOwner: fromScValueUser(structValue.getFieldValue("tender_owner")!.structValue()),
    tenderId: structValue.getFieldValue("tender_id")!.asBN(),
    criterionId: structValue.getFieldValue("criterion_id")!.asBN(),
    lotId: structValue.getFieldValue("lot_id")!.asBN(),
    offers: new Map([...structValue.getFieldValue("offers")!.mapValue().map].map(([k7, v8]) => [k7.asBN(), fromScValueOffer(v8.structValue())])),
    status: structValue.getFieldValue("status")!.asNumber(),
  };
}

export interface Offer {
  tenderOwner: User;
  tenderId: BN;
  lotId: BN;
  offerId: BN;
  applicantId: BN;
  score: Option<BN>;
}

export function newOffer(tenderOwner: User, tenderId: BN, lotId: BN, offerId: BN, applicantId: BN, score: Option<BN>): Offer {
  return { tenderOwner, tenderId, lotId, offerId, applicantId, score }
}

function fromScValueOffer(structValue: ScValueStruct): Offer {
  return {
    tenderOwner: fromScValueUser(structValue.getFieldValue("tender_owner")!.structValue()),
    tenderId: structValue.getFieldValue("tender_id")!.asBN(),
    lotId: structValue.getFieldValue("lot_id")!.asBN(),
    offerId: structValue.getFieldValue("offer_id")!.asBN(),
    applicantId: structValue.getFieldValue("applicant_id")!.asBN(),
    score: structValue.getFieldValue("score")!.optionValue().valueOrUndefined((sc9) => sc9.asBN()),
  };
}

export interface RootContractState {
  admin: BlockchainAddress;
  users: Map<BN, User>;
  tenders: Map<BN, Tender>;
}

export function newRootContractState(admin: BlockchainAddress, users: Map<BN, User>, tenders: Map<BN, Tender>): RootContractState {
  return { admin, users, tenders }
}

function fromScValueRootContractState(structValue: ScValueStruct): RootContractState {
  return {
    admin: BlockchainAddress.fromBuffer(structValue.getFieldValue("admin")!.addressValue().value),
    users: new Map([...structValue.getFieldValue("users")!.mapValue().map].map(([k10, v11]) => [k10.asBN(), fromScValueUser(v11.structValue())])),
    tenders: new Map([...structValue.getFieldValue("tenders")!.mapValue().map].map(([k12, v13]) => [k12.asBN(), fromScValueTender(v13.structValue())])),
  };
}

export function deserializeRootContractState(bytes: Buffer): RootContractState {
  const scValue = new StateReader(bytes, fileAbi.contract).readState();
  return fromScValueRootContractState(scValue);
}

export interface SecretVarId {
  rawId: number;
}

export function newSecretVarId(rawId: number): SecretVarId {
  return { rawId }
}

function fromScValueSecretVarId(structValue: ScValueStruct): SecretVarId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export function initialize(): Buffer {
  const fnBuilder = new FnRpcBuilder("initialize", fileAbi.contract);
  return fnBuilder.getBytes();
}

export function registerUser(userId: BN, userAddress: Option<BlockchainAddress>): Buffer {
  const fnBuilder = new FnRpcBuilder("register_user", fileAbi.contract);
  fnBuilder.addU64(userId);
  const optionBuilder14 = fnBuilder.addOption();
  if (userAddress !== undefined) {
    optionBuilder14.addAddress(userAddress.asBuffer());
  }
  return fnBuilder.getBytes();
}

export function createTender(ownerId: BN, tenderId: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("create_tender", fileAbi.contract);
  fnBuilder.addU64(ownerId);
  fnBuilder.addU64(tenderId);
  return fnBuilder.getBytes();
}

export function createLot(tenderId: BN, criterionId: BN, lotId: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("create_lot", fileAbi.contract);
  fnBuilder.addU64(tenderId);
  fnBuilder.addU64(criterionId);
  fnBuilder.addU64(lotId);
  return fnBuilder.getBytes();
}

export function updateLotStatus(tenderId: BN, lotId: BN, status: number): Buffer {
  const fnBuilder = new FnRpcBuilder("update_lot_status", fileAbi.contract);
  fnBuilder.addU64(tenderId);
  fnBuilder.addU64(lotId);
  fnBuilder.addU8(status);
  return fnBuilder.getBytes();
}

export function createOffer(tenderId: BN, lotId: BN, offerId: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("create_offer", fileAbi.contract);
  fnBuilder.addU64(tenderId);
  fnBuilder.addU64(lotId);
  fnBuilder.addU64(offerId);
  return fnBuilder.getBytes();
}

export function selectWinner(tenderId: BN, lotId: BN, offerId: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("select_winner", fileAbi.contract);
  fnBuilder.addU64(tenderId);
  fnBuilder.addU64(lotId);
  fnBuilder.addU64(offerId);
  return fnBuilder.getBytes();
}

