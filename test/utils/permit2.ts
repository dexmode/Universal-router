import { ethers, Wallet } from 'ethers'
import { AllowanceTransfer, PermitSingle } from 'dmode-permit2'
import { Permit2Permit } from '../../src/utils/permit2'
import { PERMIT2_ADDRESS, ROUTER_ADDRESS } from './addresses'
import { ethers } from 'ethers'

const TEST_DEADLINE = '3000000000000'

/// returns signature bytes
export async function generatePermitSignature(
  permit: PermitSingle,
  signer: Wallet,
  chainId: number,
  permitAddress: string = PERMIT2_ADDRESS
): Promise<string> {
  const { domain, types, values } = AllowanceTransfer.getPermitData(permit, permitAddress, chainId)
  return await signer._signTypedData(domain, types, values)
}

export async function generateEip2098PermitSignature(
  permit: PermitSingle,
  signer: Wallet,
  chainId: number,
  permitAddress: string = PERMIT2_ADDRESS
): Promise<string> {
  const sig = await generatePermitSignature(permit, signer, chainId, permitAddress)
  const split = ethers.utils.splitSignature(sig)
  return split.compact
}

export function toInputPermit(signature: string, permit: PermitSingle): Permit2Permit {
  return {
    ...permit,
    signature,
  }
}

export function makePermit(
  token: string,
  amount: string = ethers.constants.MaxUint256.toString(),
  nonce: string = '0',
  routerAddress: string = ROUTER_ADDRESS
): PermitSingle {
  return {
    details: {
      token,
      amount,
      expiration: TEST_DEADLINE,
      nonce,
    },
    spender: routerAddress,
    sigDeadline: TEST_DEADLINE,
  }
}
