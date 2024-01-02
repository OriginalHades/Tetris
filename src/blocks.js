/*
    Predefined blocks
*/
const L_BLOCK_TEMPLATE = [
    {
        direction: "bottom",
        segments: [
            {
                direction:"bottom",
                segments: [
                    {
                        direction:"left",
                        segments:[]
                    }
                ]
            }
        ]
    }
]
const L_REVERSE_BLOCK_TEMPLATE = [
    {
        direction: "bottom",
        segments: [
            {
                direction:"bottom",
                segments: [
                    {
                        direction:"right",
                        segments:[]
                    }
                ]
            }
        ]
    }
]
const BRICK_BLOCK_TEMPLATE = [
    {
        direction:"right",
        segments: [
            {
                direction: "bottom",
                segments:[
                    {
                        direction: "left",
                        segments:[]
                    }
                ]
            }
        ]
    }
]
const T_BLOCK_TEMPLATE = [
    {
        direction:"right",
        segments: [
            {
                direction:"top",
                segments:[]
            },
            {
                direction:"bottom",
                segments:[]
            }
        ]
    }
]
const LONG_BLOCK_TEMPLATE = [
    {
        direction:"bottom",
        segments:[
            {
                direction:"bottom",
                segments:[{
                    direction:"bottom",
                    segments:[]
                }]
            }
        ]
    }
   
]
const LG_BLOCK_TEMPLATE =[
    {
        direction: "bottom",
        segments:[]
    },
    {
        direction: "right",
        segments:[
            {
                direction: "top",
                segments: []
            }
        ]
    }
]
const LG_REVERSE_BLOCK_TEMPLATE =[
    {
        direction: "top",
        segments:[]
    },
    {
        direction: "right",
        segments:[
            {
                direction: "bottom",
                segments: []
            }
        ]
    }
]

const BLOCK_TEMPLATES = [
    L_BLOCK_TEMPLATE,
    BRICK_BLOCK_TEMPLATE,
    T_BLOCK_TEMPLATE,
    LONG_BLOCK_TEMPLATE,
    L_REVERSE_BLOCK_TEMPLATE,
    LG_BLOCK_TEMPLATE,
    LG_REVERSE_BLOCK_TEMPLATE
]