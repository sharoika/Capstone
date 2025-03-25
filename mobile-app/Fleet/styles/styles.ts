import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    padding: 24 
  },
  header: { 
    alignItems: 'center', 
    marginTop: 60, 
    marginBottom: 20 
  },
  logo: { 
    width: 196, 
    height: 144 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '600', 
    color: '#173252' 
  },
  progressBar: { 
    height: 8, 
    borderRadius: 8, 
    marginBottom: 20 
  },
  formContainer: { 
    width: '100%' 
  },
  input: { 
    height: 48, 
    backgroundColor: '#F5F5F5', 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    fontSize: 16, 
    marginBottom: 16, 
    color: '#000000' 
  },
  inputError: { 
    borderColor: '#FF3B30', 
    borderWidth: 1 
  },

  buttonContainer: { 
    flexDirection: 'row',     
    justifyContent: 'space-between',  
    alignItems: 'center',       
    marginTop: 16,            
},
button: {
    flex: 1,                    
    height: 48, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 8       
},
pageTitle: {
    fontSize: 20,          
  fontWeight: '500',    
  color: '#6D6D6D',       
  textAlign: 'center',  
  marginBottom: 16,      
  letterSpacing: 0.5,    
},
  nextButton: { 
    backgroundColor: '#4A90E2', 
    height: 48, 
    borderRadius: 8, 
    paddingHorizontal: 32, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backButton: { 
    backgroundColor: '#CCCCCC', 
    height: 48, 
    borderRadius: 8, 
    paddingHorizontal: 32, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  registerButton: { 
    backgroundColor: '#4A90E2', 
    height: 48, 
    borderRadius: 8, 
    paddingHorizontal: 32, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  navigationButtons: {
    flexDirection: 'row',            
    justifyContent: 'space-between', 
    alignItems: 'center',          
    marginTop: 16,                   
},

buttonWrapper: {
    flex: 1,                        
    marginHorizontal: 8,             
},
  footer: { 
    marginTop: 24, 
    alignItems: 'center' 
  },
  loginText: { 
    fontSize: 14, 
    color: '#6D6D6D', 
    marginBottom: 8 
  },
  loginLink: { 
    fontSize: 16, 
    color: '#4A90E2', 
    fontWeight: '600' 
  },
  map: { 
    width: '100%', 
    height: 200, 
    borderRadius: 8, 
    marginTop: 16 
  },
  actionButton: { 
    backgroundColor: '#39C9C2', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  errorText: { 
    color: '#FF3B30', 
    fontSize: 14, 
    marginBottom: 8 
  },
  documentButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: '#F5F5F5', 
    borderRadius: 8, 
    marginBottom: 16 
  },
  documentUploaded: { 
    borderColor: '#39C9C2', 
    backgroundColor: '#E6FFFA' 
  },
  documentError: { 
    borderColor: '#FF3B30', 
    borderWidth: 1 
  },
  documentTextContainer: { 
    marginLeft: 10, 
    flex: 1 
  },
  documentTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#173252' 
  },
  documentDescription: { 
    fontSize: 14, 
    color: '#6D6D6D' 
  },
});

export default styles;
