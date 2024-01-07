import * as React from 'react';
import { StyleSheet, Text, View, Alert, Dimensions, TouchableOpacity, FlatList, TouchableWithoutFeedback, Linking, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { db } from '../database/firebase-config';
import { query, onValue, ref, update, set, remove } from 'firebase/database';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth'
import MapView from 'react-native-maps';
// import Dropdown from 'react-native-modal-dropdown';

import Modal from 'react-native-modal';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

import * as theme from '../theme';


const {Marker} = MapView;

// var parkingsSpots = [];

const {height , width} = Dimensions.get('screen');

var url = "https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=";

export default class Map extends React.Component {
  state = {
    hours: {},
    active : null,
    activeModal : null,
    loginModal : null,
    dataparking : [],
    email : "",
    password : "",
    isLoading: false,
    managerOn: null,
    loginfo : null,
    addParking : null,
    title : "",
    price: 0,
    rating : 0.0,
    spots : 0,
    free : 0,
    latitude : 0.0,
    longtitude: 0.0,
    description : "",
    updateParking : null
  }

  UNSAFE_componentWillMount() {

    const datHolder = query(ref(db, 'parkingSpots/' ));
    onValue(datHolder, (snapshot) => {
      const data = snapshot.val();
      // parkingsSpots = data;
      this.setState({dataparking : data})
      // console.log(this.state.dataparking);
    })

    const hours = {};

    this.state.dataparking.map(parking => {hours[parking.id] = 1});

    this.setState({ hours });
  }

  renderHeader(){
      return(
        <View style={styles.header}>
          <View style={styles.headerLocationInfo}>
            <Text style={styles.headerTitle}>Parkiran Terdekat</Text>
            <Text style={styles.headerLocation}>Jakarta Timur</Text>
          </View>
          <View style={styles.headerIcon}>
            <TouchableOpacity onPress={() => {
              if (!this.state.loginfo){
                this.setState({ loginModal: "login" });
              } else {this.setState({managerOn : this.state.loginfo})}
            }}>
              <Ionicons name="shield-checkmark-outline" size={theme.SIZES.icon * 1.5} />
            </TouchableOpacity>
          </View>
        </View>
      )
   }

   updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }
  userLogin = () => {
    if(this.state.email === '' && this.state.password === '') {
      Alert.alert('Isi Email dan Password terlebih dahulu!')
    } else {
      this.setState({
        isLoading: true,
      });

      const auth = getAuth();

      signInWithEmailAndPassword(auth, this.state.email, this.state.password)
      .then((userCredential) => {
        // console.log(userCredential.user.stsTokenManager.accessToken);

        const userToken = userCredential.user.stsTokenManager.accessToken;

        if (!userToken) return null;
        // ^will return "email atau password salah"

        this.setState({
          email : '',
          password : '',
          isLoading: false,
          loginModal: null,
          managerOn : userCredential,
          loginfo : userCredential
        });

        //render a data management

      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
      // .auth()
      // .signInWithEmailAndPassword(this.state.email, this.state.password)
      // .then((res) => {
      //   console.log(res)
      //   console.log('User logged-in successfully!')
      //   this.setState({
      //     isLoading: false,
      //     email: '', 
      //     password: ''
      //   })
      //   // this.props.navigation.navigate('Dashboard')
      //   console.log("moved")
      // })
      // .catch(error => this.setState({ errorMessage: error.message }))
    }
  }


  createData(){
    const id = this.state.dataparking.length;

    set(ref(db, 'parkingSpots/' + id), {
      id: id,
      title: this.state.title,
      price: parseInt(this.state.price),
      rating: parseFloat(this.state.rating),
      spots: parseInt(this.state.spots),
      free: parseInt(this.state.free),
      coordinate: {
        latitude: parseFloat(this.state.latitude),
        longitude: parseFloat(this.state.longtitude)
      },
      distance : 0.0,
      description: this.state.description
    })
    .then(() => {
      this.setState({
        title : "",
        price : 0,
        rating : 0.0,
        spots : 0,
        free : 0,
        latitude : 0.0,
        longtitude : 0.0,
        description : ""
      });

      Alert.alert("Data telah ditambah!");
    })
  }

  delData(param){
    remove(ref(db, 'parkingSpots/' + param));
  }

  updateData(param){
    update(ref(db, 'parkingSpots/' + param.id), {
      title: this.state.title ? this.state.title : param.title,
      price: this.state.price ? parseInt(this.state.price) : parseInt(param.price),
      rating: this.state.rating ? parseFloat(this.state.rating) : parseFloat(param.rating),
      free: this.state.free ? parseInt(this.state.free) : parseInt(param.free),
    })
    .then(() => {
      this.setState({
        title : "",
        price : 0,
        rating : 0.0,
        free : 0
      });
      Alert.alert("Data diubah!");
    })
  }

  renderLogin() {

    const {loginModal} = this.state;

    if (!loginModal) return null;

    if(this.state.isLoading){
      return(
        <View style={styles.preloader}>
          <ActivityIndicator size="large" color="#9E9E9E"/>
        </View>
      )
    }    
    return (
      <Modal
        isVisible
        useNativeDriver
        onBackButtonPress={() => {this.setState({ activeModal: null }); this.setState({loginModal : null})}}
        onBackdropPress={() => {this.setState({ activeModal: null }); this.setState({loginModal : null})}}
        onSwipeComplete={() => {this.setState({ activeModal: null }); this.setState({loginModal : null})}}
        style={styles.modalContainer}
       > 

      <View style={styles.Logincontainer}>

      <Text style={{ color: theme.COLORS.gray, fontSize: theme.SIZES.font * 1.1, marginBottom: 10 }}>
        Harap masuk sebagai administrator
      </Text>

        <TextInput
          style={styles.inputStyle}
          placeholder="Email"
          value={this.state.email}
          onChangeText={(val) => this.updateInputVal(val, 'email')}
        />
        <TextInput
          style={styles.inputStyle}
          placeholder="Password"
          value={this.state.password}
          onChangeText={(val) => this.updateInputVal(val, 'password')}
          maxLength={15}
          secureTextEntry={true}
        />   
        <TouchableOpacity
          color="#3740FE"
          style={styles.payBtn}
          onPress={() => this.userLogin()}
        >
        <Text style={styles.loginText}>
          Login
        </Text>
        <Ionicons name='log-in-outline' size={theme.SIZES.icon * 2.1} color={theme.COLORS.white} />
        </TouchableOpacity>                     

        </View>
      </Modal>
    );
  }

   
   renderDetailModal(){
     const {activeModal , hours} = this.state;

     if (!activeModal) return null;     
     
     return(
       <Modal
        isVisible
        useNativeDriver
        style={styles.modalContainer}
        onBackButtonPress={() => {this.setState({ activeModal: null }); this.setState({loginModal : null})}}
        onBackdropPress={() => {this.setState({ activeModal: null }); this.setState({loginModal : null})}}
        onSwipeComplete={() => {this.setState({ activeModal: null }); this.setState({loginModal : null})}}
        
       >
         <View style={styles.modal}>
          <View>
            <Text style={{ fontSize: theme.SIZES.font * 1.5, marginBottom: 20 }}>
              {activeModal.title}
            </Text>
          </View>
          {/* <View style={{ paddingVertical: theme.SIZES.base }}>
            <Text style={{ color: theme.COLORS.gray, fontSize: theme.SIZES.font * 1.1 }}>
              {activeModal.description}
            </Text>
          </View> */}
          <View style={styles.modalInfo}>
            <View style={[styles.parkingIcon, {justifyContent: 'flex-start'} ]}>
              <Ionicons name='ios-pricetag' size={theme.SIZES.icon * 1.1} color={theme.COLORS.gray} />
              <Text style={{ fontSize: theme.SIZES.icon * 1.15 }}> IDR. {activeModal.price}</Text>
            </View>
            <View style={[styles.parkingIcon, {justifyContent: 'flex-start'} ]}>
              <Ionicons name='ios-star' size={theme.SIZES.icon * 1.1} color={theme.COLORS.gray} />
              <Text style={{ fontSize: theme.SIZES.icon * 1.15 }}> {activeModal.rating}</Text>
            </View>
            {/* <View style={[styles.parkingIcon, {justifyContent: 'flex-start'} ]}>
              <Ionicons name='ios-pin' size={theme.SIZES.icon * 1.1} color={theme.COLORS.gray} />
              <Text style={{ fontSize: theme.SIZES.icon * 1.15 }}> {activeModal.distance}km</Text>
            </View> */}
            <View style={[styles.parkingIcon, {justifyContent: 'flex-start'} ]}>
              <Ionicons name='ios-car' size={theme.SIZES.icon * 1.3} color={theme.COLORS.gray} />
              <Text style={{ fontSize: theme.SIZES.icon * 1.15 }}> {activeModal.free}/{activeModal.spots}</Text>
            </View>
          </View>
          <View style={styles.modalHours}>
            <Text style={{ textAlign: 'center', fontWeight: '500', }}>{activeModal.description}</Text>
            {/* <View style={styles.modalHoursDropdown}>
              {this.renderHours()}
              <Text style={{ color: theme.COLORS.gray }}>hrs</Text>
            </View> */}
          </View>
          <View>
            <TouchableOpacity style={styles.payBtn} onPress={() => this.handleDirectButt(activeModal.coordinate)}>
              <Text style={styles.payText}>
                {/* Bayar IDR{activeModal.price * hours[activeModal.id]} */}
                Arahkan
              </Text>
              <FontAwesome name='car' size={theme.SIZES.icon * 1.75} color={theme.COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
         
       </Modal>
     )
   }

  //  renderHours(){
  //    return(
  //     <Dropdown 
  //       defaultIndex={0}
  //       defaultValue={'01:00'}
  //       options={['01:00', '02:00', '03:00', '04:00', '05:00']}
  //       style={styles.hoursDropdown}
  //       dropdownStyle={styles.hoursDropdownStyle}
  //     />  
  //     <View style={styles.hoursDropdown}>
  //               <Text style={styles.hoursTitle}>05:00 hrs</Text>
  //     </View>
  //    )
  //  }

  renderParking(item){
    const { hours } = this.state;
      return(
        <TouchableWithoutFeedback key={`parking-${item?.id}`} onPress={() => this.setState({ active: item?.id, activeModal: item })} >
          <View style={[styles.parking, styles.shadow]}>
            <View style={styles.hours}>
              <Text style={styles.hoursTitle}>{item?.title} {item?.free}/{item?.spots}</Text>
              {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {this.renderHours()}
                <Text style={{ color: theme.COLORS.gray }}>hrs</Text>
              </View> */}
            </View>
            <View style={styles.parkingInfoContainer}>
              <View style={styles.parkingInfo}>
                <View style={styles.parkingIcon}>
                  <Ionicons name='ios-pricetag' size={theme.SIZES.icon} color={theme.COLORS.gray}/>
                  <Text>IDR {item?.price}</Text>
                </View>
                <View style={styles.parkingIcon}>
                  <Ionicons name='ios-star' size={theme.SIZES.icon} color={theme.COLORS.gray}/>
                  <Text>{item?.rating}</Text>
                </View>
              </View>
              <TouchableOpacity  onPress={() => this.setState({ activeModal: item })}>
              <FontAwesome name='info' size={theme.SIZES.icon * 1.75} color={theme.COLORS.white} />
                <View style={styles.buyTotal}>
               
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name='dollar' size={theme.SIZES.icon * 1.25} color={theme.COLORS.white} />
                    
                    <Text style={styles.buyTotalPrice}></Text>
                  </View>
                  <Text style={{ color: theme.COLORS.white }}>
                    {item?.price}x{hours[item?.id]} hrs
                  </Text>
                </View>
                <View style={styles.buyButton}>
                 
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
  }

  renderParkingManager(item){
    const { hours } = this.state;
      return(
        <TouchableWithoutFeedback key={`parking-${item?.id}`} onPress={() => this.setState({ active: item?.id, activeModal: item })} >
          <View style={[styles.parking, styles.shadow]}>
            <View style={styles.hours}>
              <Text style={styles.hoursTitle}>{item?.title} {item?.free}/{item?.spots}</Text>
              
              
            </View>
            <View style={styles.parkingInfoContainer}>
              <View style={styles.parkingInfo}>
                <View style={styles.parkingIcon}>
                  <Ionicons name='ios-pricetag' size={theme.SIZES.icon} color={theme.COLORS.gray}/>
                  <Text>IDR {item?.price}</Text>
                </View>
                <View style={styles.parkingIcon}>
                  <Ionicons name='ios-star' size={theme.SIZES.icon} color={theme.COLORS.gray}/>
                  <Text>{item?.rating}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => {
                if (!this.state.loginfo){
                this.setState({ loginModal: "login" });
              } else {this.setState({updateParking : item })}
              }}>
                <Ionicons name='create-outline' size={25} color={theme.COLORS.green}/>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.delData(item?.id)}>
                <Ionicons name='trash-outline' size={25} color={theme.COLORS.red}/>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
  }

  renderParkings(){
      return(
        <FlatList
          horizontal
          pagingEnabled
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          snapToAlignment="center"
          style={styles.parkings}
          data={this.state.dataparking}
          extraData={this.state}
          keyExtractor={(item, index) => `${item?.id}`}
          renderItem={({ item }) => this.renderParking(item)}
        />
      )
  }


  handleDirectButt(coordinate){
    var dirrectTo = url + coordinate.latitude + ',' + coordinate.longitude;
    Linking.openURL(dirrectTo);
    // console.log();
  }

  renderManager(){
    const {managerOn} = this.state;

    if (!managerOn) return null;

    return (
      <Modal
        isVisible
        useNativeDriver
        onBackButtonPress={() => {this.setState({ activeModal: null }); this.setState({loginModal : null}); this.setState({managerOn : null}); }}
        onBackdropPress={() => {this.setState({ activeModal: null }); this.setState({loginModal : null}); this.setState({managerOn : null});}}
        onSwipeComplete={() => {this.setState({ activeModal: null }); this.setState({loginModal : null}); this.setState({managerOn : null});}}
        style={styles.modalContainer}
       > 

      <View style={styles.managerContainer}>

      <Text style={{ color: theme.COLORS.gray, fontSize: theme.SIZES.font * 1.1, marginBottom: 10 }}>
        Welcome, {managerOn.user.email}
      </Text>

        
 
      <FlatList
          pagingEnabled
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          snapToAlignment="center"
          style={styles.parkings}
          data={this.state.dataparking}
          extraData={this.state}
          keyExtractor={(item, index) => `${item?.id}`}
          renderItem={({ item }) => this.renderParkingManager(item) }
        />
  

        <TouchableOpacity
          color="#3740FE"
          style={styles.payBtn}
          onPress={() => this.setState({addParking : "adding"})}
        >
        <Text style={styles.loginText}>
          Tambah Parkiran
        </Text>
        <Ionicons name='add-circle-outline' size={theme.SIZES.icon * 2.1} color={theme.COLORS.white} />
        </TouchableOpacity>
                             

        </View>
      </Modal>
    );
  }

  renderAdd() {

    const {addParking} = this.state;

    if (!addParking) return null;

    return (
      <Modal
        isVisible
        useNativeDriver
        onBackButtonPress={() => {this.setState({addParking : null})}}
        onBackdropPress={() => {this.setState({addParking : null})}}
        onSwipeComplete={() => {this.setState({addParking : null})}}
        style={styles.modalContainer}
       > 

      <View style={styles.addParking}>

      <Text style={{ color: theme.COLORS.gray, fontSize: theme.SIZES.font * 1.1, marginBottom: 10 }}>
        Silakan masukan data baru
      </Text>

        <TextInput
          style={styles.inputStyle}
          placeholder="Nama Parkiran"
          value={this.state.title}
          onChangeText={(val) => this.updateInputVal(val, 'title')}
          maxLength={32}
        />  

         <TextInput
          style={styles.inputStyle}
          placeholder="Harga"
          value={this.state.price}
          onChangeText={(val) => this.updateInputVal(val, 'price')}
          inputMode='numeric'
        />   

         <TextInput
          style={styles.inputStyle}
          placeholder="Rating"
          value={this.state.rating}
          onChangeText={(val) => this.updateInputVal(val, 'rating')}
          inputMode='numeric'
        />   

        <TextInput
          style={styles.inputStyle}
          placeholder="Spot"
          value={this.state.spots}
          onChangeText={(val) => this.updateInputVal(val, 'spots')}
          inputMode='numeric'
        />   

        <TextInput
          style={styles.inputStyle}
          placeholder="Tersedia"
          value={this.state.free}
          onChangeText={(val) => this.updateInputVal(val, 'free')}
          inputMode='numeric'
        />   

        <TextInput
          style={styles.inputStyle}
          placeholder="Latitude"
          value={this.state.latitude}
          onChangeText={(val) => this.updateInputVal(val, 'latitude')}
          inputMode='numeric'
        />   

        <TextInput
          style={styles.inputStyle}
          placeholder="Longtitude"
          value={this.state.longtitude}
          onChangeText={(val) => this.updateInputVal(val, 'longtitude')}
          inputMode='numeric'
        />   

        <TextInput
          style={styles.inputStyle}
          placeholder="Deskripsi"
          value={this.state.description}
          onChangeText={(val) => this.updateInputVal(val, 'description')}
          maxLength={120}
        />   

        <TouchableOpacity
          color="#3740FE"
          style={styles.payBtn}
          onPress={() => this.createData()}
        >
        <Text style={styles.loginText}>
          Tambah
        </Text>
        <Ionicons name='add-circle-outline' size={theme.SIZES.icon * 2.1} color={theme.COLORS.white} />
        </TouchableOpacity>                     

        </View>
      </Modal>
    );
  }

  renderUpdate() {

    const {updateParking} = this.state;
    
    if (!updateParking) return null;

    return (
      <Modal
        isVisible
        useNativeDriver
        onBackButtonPress={() => {this.setState({updateParking : null})}}
        onBackdropPress={() => {this.setState({updateParking : null})}}
        onSwipeComplete={() => {this.setState({updateParking : null})}}
        style={styles.modalContainer}
       > 

      <View style={styles.addUpdate}>

      <Text style={{ color: theme.COLORS.gray, fontSize: theme.SIZES.font * 1.1, marginBottom: 10 }}>
        Silakan ubah data
      </Text>

        <TextInput
          style={styles.inputStyle}
          placeholder={updateParking.title}
          value={this.state.title}
          onChangeText={(val) => this.updateInputVal(val, 'title')}
          maxLength={32}
        />  

         <TextInput
          style={styles.inputStyle}
          placeholder="Harga Baru"
          value={this.state.price}
          onChangeText={(val) => this.updateInputVal(val, 'price')}
          inputMode='numeric'
        />   

         <TextInput
          style={styles.inputStyle}
          placeholder="Rating Baru"
          value={this.state.rating}
          onChangeText={(val) => this.updateInputVal(val, 'rating')}
          inputMode='numeric'
        />   

        <TextInput
          style={styles.inputStyle}
          placeholder="Free"
          value={this.state.free}
          onChangeText={(val) => this.updateInputVal(val, 'free')}
          inputMode='numeric'
        />   

        <TouchableOpacity
          color="#3740FE"
          style={styles.payBtn}
          onPress={() => this.updateData(updateParking)}
        >
        <Text style={styles.loginText}>
          Ubah
        </Text>
        <Ionicons name='create-outline' size={theme.SIZES.icon * 2.1} color={theme.COLORS.white} />
        </TouchableOpacity>                     

        </View>
      </Modal>
    );
  }

  render(){
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <MapView style={styles.map}
            initialRegion={{
                latitude: -6.214815695005689,
                longitude: 106.89913010058993,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
        >
          {this.state.dataparking.map(parking =>
            <Marker 
              key={`marker-${parking.id}`}
              coordinate={parking.coordinate}>
                <TouchableWithoutFeedback onPress={() => this.setState({ active: parking.id })} >
                  <View style={[
                    styles.marker,
                    styles.shadow,
                    this.state.active === parking.id ? styles.active : null
                  ]}>
                    <Text style={styles.markerPrice}>{parking.title}</Text>
                    <Text style={styles.markerStatus}> ({parking.free}/{parking.spots})</Text>
                  </View>
                </TouchableWithoutFeedback>
            </Marker>
            )}
        </MapView>
        {this.renderParkings()}
        {this.renderDetailModal()}
        {this.renderLogin()}
        {this.renderManager()}
        {this.renderAdd()}
        {this.renderUpdate()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.white
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.SIZES.base * 2,
    paddingTop: theme.SIZES.base * 2.5,
    paddingBottom: theme.SIZES.base * 1.5,
  },
  headerTitle: {
    color: theme.COLORS.gray,
  },
  headerLocation: {
    fontSize: theme.SIZES.font,
    fontWeight: '500',
    paddingVertical: theme.SIZES.base / 3,
  },
  headerIcon :{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
  },
  headerLocationInfo : {
   flex: 1, 
   justifyContent: 'center' 
  },
  map: {
    flex: 3
  },
  parkings:{
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: theme.SIZES.base * 2,
    paddingBottom : theme.SIZES.base * 2
  },
  parking: {
    flexDirection: 'row',
    backgroundColor: theme.COLORS.white,
    borderRadius: 6,
    padding: theme.SIZES.base,
    marginHorizontal: theme.SIZES.base * 2,
    width: width - (24 * 2),
    marginVertical : theme.SIZES.base * 1
  },
  buy: {
    flexDirection: 'row',
    paddingHorizontal: theme.SIZES.base * 1.5,
    paddingVertical: theme.SIZES.base,
    backgroundColor: theme.COLORS.red,
    borderRadius: 6,
    marginTop: theme.SIZES.base
  },
  marker: {
    flexDirection: 'row',
    backgroundColor: theme.COLORS.white,
    borderRadius: theme.SIZES.base * 2,
    paddingVertical: 12,
    paddingHorizontal: theme.SIZES.base * 2,
    borderWidth: 1,
    borderColor: theme.COLORS.white,
  },
  markerPrice: { 
    color: theme.COLORS.red, 
    fontWeight: 'bold', 
  },
  markerStatus: { 
    color: theme.COLORS.gray
  },
  shadow: {
    shadowColor: theme.COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // backgroundColor : '#FFFFFF',
    // // elevation : 15
  },
  active: {
    borderColor: theme.COLORS.red,
  },
  hours : {
    flex: 1,
    flexDirection: 'column',
    marginLeft: theme.SIZES.base / 2,
    justifyContent: 'space-evenly',
  },
  hoursTitle: {
    fontSize: theme.SIZES.text,
    fontWeight: '500',
  },
  parkingInfoContainer : {
    flex : 1.5, 
    flexDirection : 'row'
  },
  parkingInfo : {
    justifyContent: 'space-evenly',
    marginHorizontal : theme.SIZES.base * 1.5
  },
  parkingIcon : {
    flexDirection : 'row', 
    justifyContent : 'space-between', 
  },
  buyTotal : {
    flex:1, 
    justifyContent: 'space-evenly'
  },
  buyButton : {
    flex : 0.5, 
    justifyContent : 'center', 
    alignItems : 'center',
    width: 100
  },
  buyTotalPrice : {
    color: theme.COLORS.white,
    fontSize: theme.SIZES.base * 2,
    fontWeight: '600',
    paddingLeft: theme.SIZES.base / 4,
  },
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modal: {
    flexDirection: 'column',
    height: height * 0.60,
    padding: theme.SIZES.base * 2,
    // width : width,
    backgroundColor: theme.COLORS.white,
    borderTopLeftRadius: theme.SIZES.base,
    borderTopRightRadius: theme.SIZES.base,
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: theme.SIZES.base,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.COLORS.overlay,
    borderBottomColor: theme.COLORS.overlay,
  },
  modalHours: {
    paddingVertical: height * 0.15,
  },
  modalHoursDropdown: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.SIZES.base,
  },
  payBtn: {
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.SIZES.base * 1.5,
    backgroundColor: theme.COLORS.red,
  },
  payText: {
    fontWeight: '600',
    fontSize: theme.SIZES.base * 1.5,
    color: theme.COLORS.white,
  },
  hoursDropdownStyle: {
    marginLeft: -theme.SIZES.base,
    paddingHorizontal: theme.SIZES.base / 2,
    marginVertical: -(theme.SIZES.base + 1),
  },
  hoursDropdown: {
    borderRadius: theme.SIZES.base / 2,
    borderColor: theme.COLORS.overlay,
    borderWidth: 1,
    paddingHorizontal: theme.SIZES.base,
    paddingVertical: theme.SIZES.base/1.5,
    marginRight: theme.SIZES.base / 2,
  },
  Logincontainer: {
    flexDirection: 'column',
    height: height * 0.35,
    padding: theme.SIZES.base * 2,
    // width : width,
    backgroundColor: theme.COLORS.white,
    borderTopLeftRadius: theme.SIZES.base,
    borderTopRightRadius: theme.SIZES.base,
  },
  inputStyle: {
    width: '100%',
    marginBottom: 15,
    paddingBottom: 15,
    alignSelf: "center",
    borderColor: "#ccc",
    borderBottomWidth: 1
  },
  loginText: {
    fontWeight: '600',
    fontSize: theme.SIZES.base * 1.5,
    color: theme.COLORS.white,
    textAlign: "center"
  },
  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  managerContainer: {
    flexDirection: 'column',
    height: height * 0.90,
    padding: theme.SIZES.base * 2,
    // width : width,
    backgroundColor: "rgba(242, 231, 231, 0.8)",
    borderTopLeftRadius: theme.SIZES.base,
    borderTopRightRadius: theme.SIZES.base,
  },
  parkingManager : {
    borderBottomWidth: 2
  },

  addParking : {
    flexDirection: 'column',
    height: height * 0.80,
    padding: theme.SIZES.base * 2,
    // width : width,
    backgroundColor: theme.COLORS.white,
    borderTopLeftRadius: theme.SIZES.base,
    borderTopRightRadius: theme.SIZES.base,
  },

  addUpdate : {
    flexDirection: 'column',
    height: height * 0.50,
    padding: theme.SIZES.base * 2,
    // width : width,
    backgroundColor: theme.COLORS.white,
    borderTopLeftRadius: theme.SIZES.base,
    borderTopRightRadius: theme.SIZES.base,
  }
});
