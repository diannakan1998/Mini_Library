import unittest


def decodeMessage(message):
        #init the array
        data = ['' for x in range(10)] 
        params = 0
        i = 0
        print(message)

        #find the first ~
        while message[i] != '~':
                i += 1

        #record the current parse position and mark the start point
        i += 1
        eol = i
        while True:

                #if a comma or ~ is seen
                if message[i] == ',' or message[i] == '~':

                        #record the data from the endpoint of the last parameter to the current position
                        data[params] = message[eol:i]

                        #if the character was a ~, exit and return the array
                        if message[i] == '~':
                                return data
                        #otherwise increment the current pos, save the end location of the current param
                        #and inc number of params to index the array
                        i += 1
                        eol = i + 1
                        params += 1

                        
                #if the character was not a comma or a ~ move onto the next character    
                i += 1


def parseBarcode(BARCODE_NUM):

        for i in range(len(BARCODE_NUM)):
                print("i: {} num: ".format(i))
                print(BARCODE_NUM[i:i+3] )
                if BARCODE_NUM[i:i+3] == '09 ':

                    for j in range(i+3, len(BARCODE_NUM)):
                        print('\n j {}\n'.format(j))
                        if BARCODE_NUM[j] not in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] or j == len(BARCODE_NUM) - 1:

                            temp = BARCODE_NUM[i+3:j+1]
                            return temp[:len(temp)].strip()



class TestFunctions(unittest.TestCase):

    def testDecodeMessage(self):

        self.assertEqual(decodeMessage('~~')[0], '')
        self.assertEqual(decodeMessage('~12~')[0], '12')
        self.assertEqual(decodeMessage('~1, 145, abcdef~')[:3], ['1', '145', 'abcdef'])
        self.assertEqual(decodeMessage('garbage !!~1, 145, abcdef~moregarb')[:3], ['1', '145', 'abcdef'])
        self.assertEqual(decodeMessage('asdfd~~ghhg')[0], '')
        self.assertEqual(decodeMessage(' sadfsadf    ~12~fsd')[0], '12')


    def testParseBarcode(self):

        self.assertEqual(parseBarcode('09 1'), '1')
        self.assertEqual(parseBarcode('  09 1  '), '1')







if __name__ == '__main__':
    unittest.main()
