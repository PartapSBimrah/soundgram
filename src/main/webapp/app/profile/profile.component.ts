import { Component, OnInit } from '@angular/core';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { TagService } from 'app/entities/tag/tag.service';
import { PostService } from 'app/entities/post/post.service';
import { ITag, Tag } from 'app/shared/model/tag.model';
import { IPost } from 'app/shared/model/post.model';
import { AudioFileService } from 'app/entities/audio-file/audio-file.service';
import { IAudioFile } from 'app/shared/model/audio-file.model';
import { FormBuilder, Validators } from '@angular/forms';

// import { Account } from "app/core/user/user.service";

@Component({
  selector: 'jhi-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: IUser;
  userTags: ITag[];
  userPosts: IPost[];
  userAudioFiles: IAudioFile[];
  account: Account;

  allTags: ITag[];
  success: boolean;

  avatar: any;

  tagForm = this.fb.group({
    tagName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern('^[_.@A-Za-z0-9-]*$')]]
  });

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private tagService: TagService,
    private postService: PostService,
    private audioFileService: AudioFileService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.success = false;
    this.accountService.identity().subscribe((account: Account) => {
      this.account = account;
      console.error('user account name: ' + this.account.login);
      this.identificationSuccess();
    });

    this.tagService.query().subscribe(res => {
      this.allTags = res.body;
    });
  }

  identificationSuccess() {
    this.userService.find(this.account.login).subscribe(res => {
      this.user = res;
    });

    this.loadAvatar();
    this.refreshTags(); // load tags

    this.postService.getUserPosts(this.account.login).subscribe(
      res => {
        this.userPosts = res.body;
        console.error('posts: ' + this.userPosts.length);
      },
      res => {
        console.error('posts error: ' + res.body);
      }
    );

    this.audioFileService.getUserFiles().subscribe(res => {
      this.userAudioFiles = res.body;
      console.error('audioFiles: ' + this.userAudioFiles.length);
    });
  }

  loadAvatar() {
    this.accountService.getAvatar(this.account.imageUrl).subscribe(
      res => {
        const imageUrl = URL.createObjectURL(res);
        console.error('imageUrl: ' + imageUrl);
        this.avatar = document.querySelector('img');
        this.avatar.addEventListener('load', () => URL.revokeObjectURL(imageUrl));
        document.querySelector('img').src = imageUrl;
        // console.error('img file: ' + this.avatar);
      },
      res => {
        console.error('Image resource error: ' + res);
      }
    );
  }

  refreshTags() {
    this.tagService.findUserTags(this.account.login).subscribe(res => {
      this.userTags = res.body;
      console.error('tags: ' + this.userTags.length);
    });
  }

  addTagToProfile() {
    const newTagName = this.tagForm
      .get(['tagName'])
      .value.toString()
      .toLowerCase();
    let tagToAdd = null;
    for (const tag of this.allTags) {
      if (tag.name === newTagName) {
        tagToAdd = tag;
        break;
      }
    }
    if (tagToAdd === null) {
      tagToAdd = {
        ...new Tag(),
        id: undefined,
        name: newTagName,
        users: this.user
      };
      this.tagService.create(tagToAdd).subscribe(res => {
        this.userTags.push(res.body); // add new tag to user
      });
    } else {
      this.tagService.addUserToTag(tagToAdd).subscribe(() => {
        // this.userTags.push(res.body);
        this.refreshTags();
      });
    }
  }

  deleteTagFromProfile(tag: ITag) {
    const tagUsers = tag.users;
    const userIndex = tagUsers.findIndex(ut => ut.login === this.user.login);
    if (userIndex > -1) {
      tagUsers.splice(userIndex, 1);
    }
    tag.users = tagUsers;
    this.tagService.update(tag).subscribe(() => {
      this.refreshTags();
    });
  }
}
