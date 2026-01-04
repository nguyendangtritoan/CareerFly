import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from '../lib/utils'

export default forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = index => {
        const item = props.items[index]

        if (item) {
            props.command({ id: item })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[12rem] p-1">
            {props.items.length ? (
                props.items.map((item, index) => (
                    <button
                        className={cn(
                            "flex items-center w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                            index === selectedIndex ? "bg-action-primary text-white" : "text-zinc-300 hover:bg-zinc-800"
                        )}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        #{item}
                    </button>
                ))
            ) : (
                <div className="px-2 py-1.5 text-sm text-zinc-500">
                    Create new tag...
                </div>
            )}
        </div>
    )
})
