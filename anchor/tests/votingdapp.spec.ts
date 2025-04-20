import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Votingdapp } from '../target/types/votingdapp'
import { program } from '@coral-xyz/anchor/dist/cjs/native/system';
import { before } from 'node:test';

const votingAddress = new PublicKey("t4xet3niAL2gTRxw41M4NjsqAwZHGmWiCnPrBdUGRMJ") ;

const IDL = require('../target/idl/votingdapp.json');

describe('votingdapp', () => {
  let context;
  let provider;
  let votingProgram : Program<Votingdapp>;

  beforeAll(async () => {
     context = await startAnchor("", [{name : "votingdapp",programId: votingAddress}], []);
     provider = new BankrunProvider(context);

     votingProgram = new Program<Votingdapp> (IDL, provider,);
  });

  test('Initialize Poll', async () => {

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "Who is the best player?",
      new anchor.BN(0),
      new anchor.BN(1743091168),
    ).rpc();

    const [pollAdddress] =  PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAdddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("Who is the best player?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  })

  it("initialize candidate", async () => {
    await votingProgram.methods.initializeCandidate(
      "Messi",
      new anchor.BN(1),
    ).rpc();
    await votingProgram.methods.initializeCandidate(
      "Ronaldo",
      new anchor.BN(1),
    ).rpc();

    const [messiaddress] =  PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8),Buffer.from("Messi")],
      votingAddress,
    )
    const [ronaldoaddress] =  PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8),Buffer.from("Ronaldo")],
      votingAddress,
    )
    const messi = await votingProgram.account.candidate.fetch(messiaddress);
    console.log(messi);
    const ronaldo = await votingProgram.account.candidate.fetch(ronaldoaddress);
    console.log(ronaldo);
    expect(messi.candidateName).toEqual("Messi");
    expect(ronaldo.candidateName).toEqual("Ronaldo");
  });

  it("vote", async () => {
  });
})
