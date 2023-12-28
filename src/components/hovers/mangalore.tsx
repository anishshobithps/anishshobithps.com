import * as react from 'react';

import { Button } from '@/components/ui/button';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"


export function Mangalore() {
    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Button variant={"link"}>Mangaluru, India</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                        <p className="text-sm">
                            Mangalore, a bustling port city in the state of Karnataka on India's southwest coast, is renowned for its varied cuisine—particularly its mouthwatering seafood—beautiful beaches, and rich cultural legacy.
                        </p>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}