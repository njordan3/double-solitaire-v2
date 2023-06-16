import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilityService {
    public toString(value: any): string {
        if (value && typeof value !== 'object') {
            return String(value);
        }

        return '';
    }
}
