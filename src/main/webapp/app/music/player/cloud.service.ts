import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { HttpResponse } from '@angular/common/http';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { AudioObject, IAudioObject } from 'app/music/player/audio-object.model';

@Injectable({
  providedIn: 'root'
})
export class CloudService {
  /*  files: any = [
// tslint:disable-next-line: max-line-length
    { url: 'https://ia801504.us.archive.org/3/items/EdSheeranPerfectOfficialMusicVideoListenVid.com/Ed_Sheeran_-_Perfect_Official_Music_Video%5BListenVid.com%5D.mp3',
      name: 'Perfect',
      artist: ' Ed Sheeran'
    },
    {
// tslint:disable-next-line: max-line-length
      url: 'https://ia801609.us.archive.org/16/items/nusratcollection_20170414_0953/Man%20Atkiya%20Beparwah%20De%20Naal%20Nusrat%20Fateh%20Ali%20Khan.mp3',
      name: 'Man Atkeya Beparwah',
      artist: 'Nusrat Fateh Ali Khan'
    },
    { url: 'https://ia801503.us.archive.org/15/items/TheBeatlesPennyLane_201805/The%20Beatles%20-%20Penny%20Lane.mp3',
      name: 'Penny Lane',
      artist: 'The Beatles'
    }
  ];*/
  private files: IAudioObject[];

  constructor(private audioFileService: AudioFileService) {}

  getFiles(iAudioFiles: IAudioFile[]) {
    for (const file of iAudioFiles) {
      this.audioFileService.getFile(file.id).subscribe(
        res => {
          const blobUrl = URL.createObjectURL(res);
          this.files.push({
            ...new AudioObject(),
            url: blobUrl,
            title: file.title,
            user: file.iconPath // user id
          });
          // console.error('File resource title: ' + res.headers.get('filename'));
          // console.error('File name: ' + res.headers.getAttributeNames());
        },
        (res: HttpResponse<IAudioFile>) => {
          console.error('File resource error: ' + res);
        }
      );
    }
    return of(this.files);
  }
}