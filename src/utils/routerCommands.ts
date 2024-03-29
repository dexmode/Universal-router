import { defaultAbiCoder } from 'ethers/lib/utils'

/**
 * CommandTypes
 * @description Flags that modify a command's execution
 * @enum {number}
 */
export enum CommandType {
  V3_SWAP_EXACT_IN = 0x00,
  V3_SWAP_EXACT_OUT = 0x01,
  PERMIT2_TRANSFER_FROM = 0x02,
  PERMIT2_PERMIT_BATCH = 0x03,
  SWEEP = 0x04,
  TRANSFER = 0x05,
  PAY_PORTION = 0x06,

  V2_SWAP_EXACT_IN = 0x08,
  V2_SWAP_EXACT_OUT = 0x09,
  PERMIT = 0x0a,
  WRAP_ETH = 0x0b,
  UNWRAP_WETH = 0x0c,
  PERMIT2_TRANSFER_FROM_BATCH = 0x0d,

  // NFT-related command types
  SEAPORT = 0x10,
  LOOKS_RARE_721 = 0x11,
  NFTX = 0x12,
  CRYPTOPUNKS = 0x13,
  LOOKS_RARE_1155 = 0x14,
  OWNER_CHECK_721 = 0x15,
  OWNER_CHECK_1155 = 0x16,

  X2Y2_721 = 0x18,
  SUDOSWAP = 0x19,
  NFT20 = 0x1a,
  X2Y2_1155 = 0x1b,
  FOUNDATION = 0x1c,
}

const PERMIT_STRUCT =
  '((address token,uint160 amount,uint48 expiration,uint48 nonce) details, address spender, uint256 sigDeadline)'

const PERMIT_BATCH_STRUCT =
  '((address token,uint160 amount,uint48 expiration,uint48 nonce)[] details, address spender, uint256 sigDeadline)'

const ALLOW_REVERT_FLAG = 0x80

const REVERTABLE_COMMANDS = new Set<CommandType>([
  CommandType.SEAPORT,
  CommandType.NFTX,
  CommandType.LOOKS_RARE_721,
  CommandType.LOOKS_RARE_1155,
  CommandType.X2Y2_721,
  CommandType.X2Y2_1155,
  CommandType.FOUNDATION,
  CommandType.SUDOSWAP,
  CommandType.NFT20,
  CommandType.CRYPTOPUNKS,
])

const ABI_DEFINITION: { [key in CommandType]: string[] } = {
  [CommandType.PERMIT]: [PERMIT_STRUCT, 'bytes'],
  [CommandType.PERMIT2_PERMIT_BATCH]: [PERMIT_BATCH_STRUCT, 'bytes'],
  [CommandType.PERMIT2_TRANSFER_FROM]: ['address', 'address', 'uint160'],
  [CommandType.PERMIT2_TRANSFER_FROM_BATCH]: ['bytes'],
  [CommandType.TRANSFER]: ['address', 'address', 'uint256'],
  [CommandType.V3_SWAP_EXACT_IN]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
  [CommandType.V3_SWAP_EXACT_OUT]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
  [CommandType.V2_SWAP_EXACT_IN]: ['address', 'uint256', 'uint256', 'address[]', 'bool'],
  [CommandType.V2_SWAP_EXACT_OUT]: ['address', 'uint256', 'uint256', 'address[]', 'bool'],
  [CommandType.SEAPORT]: ['uint256', 'bytes'],
  [CommandType.WRAP_ETH]: ['address', 'uint256'],
  [CommandType.UNWRAP_WETH]: ['address', 'uint256'],
  [CommandType.SWEEP]: ['address', 'address', 'uint256'],
  [CommandType.NFTX]: ['uint256', 'bytes'],
  [CommandType.LOOKS_RARE_721]: ['uint256', 'bytes', 'address', 'address', 'uint256'],
  [CommandType.LOOKS_RARE_1155]: ['uint256', 'bytes', 'address', 'address', 'uint256', 'uint256'],
  [CommandType.X2Y2_721]: ['uint256', 'bytes', 'address', 'address', 'uint256'],
  [CommandType.X2Y2_1155]: ['uint256', 'bytes', 'address', 'address', 'uint256', 'uint256'],
  [CommandType.FOUNDATION]: ['uint256', 'bytes', 'address', 'address', 'uint256'],
  [CommandType.PAY_PORTION]: ['address', 'address', 'uint256'],
  [CommandType.SUDOSWAP]: ['uint256', 'bytes'],
  [CommandType.OWNER_CHECK_721]: ['address', 'address', 'uint256'],
  [CommandType.OWNER_CHECK_1155]: ['address', 'address', 'uint256', 'uint256'],
  [CommandType.NFT20]: ['uint256', 'bytes'],
  [CommandType.CRYPTOPUNKS]: ['uint256', 'address', 'uint256'],
}

export class RoutePlanner {
  commands: string
  inputs: string[]

  constructor() {
    this.commands = '0x'
    this.inputs = []
  }

  addCommand(type: CommandType, parameters: any[], allowRevert = false): void {
    let command = createCommand(type, parameters)
    this.inputs.push(command.encodedInput)
    if (allowRevert) {
      if (!REVERTABLE_COMMANDS.has(command.type)) {
        throw new Error(`command type: ${command.type} cannot be allowed to revert`)
      }
      command.type = command.type | ALLOW_REVERT_FLAG
    }

    this.commands = this.commands.concat(command.type.toString(16).padStart(2, '0'))
  }
}

export type RouterCommand = {
  type: CommandType
  encodedInput: string
}

export function createCommand(type: CommandType, parameters: any[]): RouterCommand {
  const encodedInput = defaultAbiCoder.encode(ABI_DEFINITION[type], parameters)
  return { type, encodedInput }
}
