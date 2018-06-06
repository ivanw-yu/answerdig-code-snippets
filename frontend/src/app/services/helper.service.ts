import {Injectable} from '@angular/core';

@Injectable()
export class HelperService {
 
    convertObjectIdToDate(id : string){
        let timestamp = id.toString().substring(0,8);
        return new Date( parseInt( timestamp, 16 ) * 1000 );
    }
}