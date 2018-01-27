import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore,AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';


/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
export interface ChatInterface { username: string; message: string; specialMessage:boolean}
export interface ChatIdInterface extends ChatInterface { id:string }
@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  private itemsCollection: AngularFirestoreCollection<ChatInterface>;
  items: Observable<ChatInterface[]>;
  username:string="";
  message:string="";
  _chatSubscription;
  messages:object[]=[];
  chats: Observable<ChatIdInterface[]>;
  constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
  	console.log(this.navParams);
  	this.username=navParams.get('username');
  	// this.items = db.collection('items').valueChanges();

  	this.itemsCollection = afs.collection('items');
    this.items = this.itemsCollection.valueChanges();
    // this.items = this.afs.collection('items').valueChanges();

    this.chats=this.itemsCollection.stateChanges(['added']).map(data=>{
    // this.chats=this.itemsCollection.snapshotChanges().map(data=>{
    	console.log("Hello"+data);
    	return data.map(a=>{
    	const data = a.payload.doc.data() as ChatInterface;
        const id = a.payload.doc.id;
        return { id, ...data };
    	});
    });
    this._chatSubscription=this.items.subscribe(data=>{
    	// console.log(data);
    	// data.map(elem=>{
    	// 	this.messages.push(elem);
    	// })
    	this.messages=data;
    })

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    this.itemsCollection.add({specialMessage:true,message:`${this.username} has joined the room`,username:this.username}).then(()=>{}).catch((err)=>{console.log(err)});
  }
  addItem() {
    this.itemsCollection.add({username:this.username,message:this.message,specialMessage:false}).then(()=>{
    	//message sent to servers
    }).catch((err)=>{console.log(err)});
    console.log("Add item called");
  }
  ionViewWillLeave(){
  	this._chatSubscription.unsubscribe();
    this.itemsCollection.add({specialMessage:true,message:`${this.username} has left the room`,username:this.username}).then(()=>{}).catch((err)=>{console.log(err)});

  }
}
