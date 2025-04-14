/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tita_flow.json`.
 */
export type TitaFlow = {
  "address": "4qgU6nZVrBQdYoaKHNBZju32cX3QqKhhDx23m3VCCuHp",
  "metadata": {
    "name": "titaFlow",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "contribute",
      "discriminator": [
        82,
        33,
        68,
        131,
        32,
        0,
        205,
        95
      ],
      "accounts": [
        {
          "name": "contributor",
          "writable": true,
          "signer": true
        },
        {
          "name": "flow",
          "writable": true
        },
        {
          "name": "contribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  116,
                  97,
                  45,
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "flow"
              },
              {
                "kind": "account",
                "path": "contributor"
              }
            ]
          }
        },
        {
          "name": "contributorTokenAccount",
          "writable": true
        },
        {
          "name": "flowTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createFlow",
      "discriminator": [
        139,
        104,
        255,
        32,
        61,
        236,
        41,
        31
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "flow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  116,
                  97,
                  45,
                  102,
                  108,
                  111,
                  119
                ]
              },
              {
                "kind": "arg",
                "path": "flowId"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "flowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  116,
                  97,
                  45,
                  102,
                  108,
                  111,
                  119,
                  45,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "flow"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "flowId",
          "type": "string"
        },
        {
          "name": "goal",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "endTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "milestones",
          "type": {
            "option": {
              "vec": {
                "defined": {
                  "name": "milestone"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "contribution",
      "discriminator": [
        182,
        187,
        14,
        111,
        72,
        167,
        242,
        212
      ]
    },
    {
      "name": "flow",
      "discriminator": [
        126,
        151,
        86,
        177,
        58,
        153,
        167,
        203
      ]
    }
  ],
  "events": [
    {
      "name": "contributionEvent",
      "discriminator": [
        66,
        160,
        5,
        247,
        2,
        131,
        249,
        150
      ]
    },
    {
      "name": "flowCreatedEvent",
      "discriminator": [
        97,
        126,
        21,
        187,
        40,
        199,
        96,
        104
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidMilestoneAmount",
      "msg": "Invalid Milestone Amount"
    },
    {
      "code": 6001,
      "name": "emptyFlowId",
      "msg": "Empty Flow ID"
    },
    {
      "code": 6002,
      "name": "flowIdTooLong",
      "msg": "Flow ID too long"
    },
    {
      "code": 6003,
      "name": "invalidGoalAmount",
      "msg": "Invalid Goal Amount"
    },
    {
      "code": 6004,
      "name": "invalidStartTime",
      "msg": "Invalid start time"
    },
    {
      "code": 6005,
      "name": "invalidTimeframe",
      "msg": "Invalid timeframe"
    },
    {
      "code": 6006,
      "name": "tooManyMilestones",
      "msg": "Too many milestones"
    },
    {
      "code": 6007,
      "name": "noMilestonesSpecified",
      "msg": "No milestones specified"
    },
    {
      "code": 6008,
      "name": "invalidMilestoneDeadline",
      "msg": "Invalid milestone deadline"
    },
    {
      "code": 6009,
      "name": "milestoneAfterEndTime",
      "msg": "Milestone deadline is after end time"
    },
    {
      "code": 6010,
      "name": "mathOverflow",
      "msg": "mathOverflow"
    },
    {
      "code": 6011,
      "name": "milestoneTotalMismatch",
      "msg": "Milestone total mismatch"
    },
    {
      "code": 6012,
      "name": "invalidContributionAmount",
      "msg": "invalid"
    },
    {
      "code": 6013,
      "name": "flowNotActive",
      "msg": "Flow not active"
    },
    {
      "code": 6014,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6015,
      "name": "invalidTokenAccount",
      "msg": "Invalid token owner"
    },
    {
      "code": 6016,
      "name": "invalidTokenOwner",
      "msg": "Invalid token owner"
    },
    {
      "code": 6017,
      "name": "flowEnded",
      "msg": "Flow ended"
    },
    {
      "code": 6018,
      "name": "flowNotStarted",
      "msg": "Flow not started"
    }
  ],
  "types": [
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flow",
            "type": "pubkey"
          },
          {
            "name": "contributor",
            "type": "pubkey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "firstContribution",
            "type": "i64"
          },
          {
            "name": "lastContribution",
            "type": "i64"
          },
          {
            "name": "contributionCount",
            "type": "u32"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "contributionEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flow",
            "type": "pubkey"
          },
          {
            "name": "contributor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalContributed",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "flow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flowId",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "raised",
            "type": "u64"
          },
          {
            "name": "startDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endDate",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "flowStatus",
            "type": {
              "defined": {
                "name": "flowStatus"
              }
            }
          },
          {
            "name": "contributorCount",
            "type": "u32"
          },
          {
            "name": "milestones",
            "type": {
              "option": {
                "vec": {
                  "defined": {
                    "name": "milestone"
                  }
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "flowCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "flowId",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "isMilestone",
            "type": "bool"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "flowStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "completed"
          },
          {
            "name": "canceled"
          }
        ]
      }
    },
    {
      "name": "milestone",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "completed",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
