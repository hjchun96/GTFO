#from torch.utils.data import Dataset, DataLoader
import torch
import torchvision
from torch.utils.data import Dataset, DataLoader

from torchvision import transforms
from torch.utils.data.sampler import SubsetRandomSampler

import os
import pdb
import numpy as np
from skimage import io, transform
from PIL import Image
import cv2

class CPDataset(Dataset):

    def __init__(self, root_dir, transform=None, roi_pool=False, num_samples = 0):
        self.root_dir = root_dir
        self.transform = transform
        self.roi_pool = roi_pool
        self.num_samples = num_samples

    def __len__(self):
        return len([name for name in os.listdir(self.root_dir) if os.path.isfile(self.root_dir+name)])

    def __getitem__(self, idx):
        
        img_dir = ''
        img_num = str(idx + 1)
        img_ext = '.png'
        img_file = img_num + img_ext
        img_name = os.path.join(self.root_dir, img_dir, img_file)
        image = Image.open(img_name)
        
        if self.transform:
          image = self.transform(image)
        
        sample = None
        if self.roi_pool:
          s = image[1,:,:].size()
          roi = np.zeros([1,1,4])
          roi[0,0,:] = [0, 0, s[0], s[1]]
          roi = torch.tensor(roi)

          im_pooled = image[1,:,:].unsqueeze(0).unsqueeze(0).double()
          im_pooled = roi_align(im_pooled, roi, chunk_size).squeeze().float().unsqueeze(0)
          gt_pooled = image[0,:,:].unsqueeze(0).unsqueeze(0).double()
          gt_pooled = roi_align(gt_pooled, roi, chunk_size).squeeze().float()

          sample = {
                    'image'        : im_pooled, 
                    'gt_image'     : gt_pooled, 
                   }
        else:
          sample = {
                  'image'        : image[1,:,:].unsqueeze(0), 
                  'gt_image'     : image[0,:,:], 
                 }
          
        return sample
      
data_dir = "CIS680_FINAL/data"

files = os.listdir(data_dir)
imgs = [i for i in files if i.endswith("png")]

chunk_size = 256

np.random.seed(0)
num_train = len(imgs)
indices = list(range(num_train))
split = int(num_train/5)

# Random, non-contiguous split
test_idx = np.random.choice(indices, size=split, replace=False)
train_idx = list(set(indices) - set(test_idx))
train_sampler = SubsetRandomSampler(train_idx)
test_sampler = SubsetRandomSampler(test_idx)

batch_sz = 10
trainingtransform = transforms.Compose(
    [transforms.RandomCrop(chunk_size),
     transforms.ToTensor()])
testingtransform = transforms.Compose(
    [transforms.RandomCrop(chunk_size),
     transforms.ToTensor()])
# Un-Comment and comment the above lines if you're doing ROI Pooling
# transform_img = transforms.Compose(
#     [transforms.ToTensor()])

dset_train = CPDataset(data_dir, transform = trainingtransform, num_samples = num_train - split, roi_pool = False)
dset_test = CPDataset(data_dir, transform = trainingtransform, num_samples = split, roi_pool = False)

train_dataloader = DataLoader(dset_train, batch_size=batch_sz, shuffle=False, num_workers=1, sampler=train_sampler)
test_dataloader = DataLoader(dset_test, batch_size=batch_sz, shuffle=False, num_workers=1, sampler=test_sampler)
net = None


import torch
import numpy as np
import torch.nn as nn
import torch.optim as optim
import torchvision
from torchvision import transforms, datasets
#import matplotlib.pyplot as plt
import torch.nn.functional as F

def display_mask(mask):
  plt.figure()
  plt.imshow(mask.detach().numpy())
  plt.show()

def display_img(image):
  fig,ax = plt.subplots(1)
  ax.imshow(image)
  plt.show()
  
  
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        n_class = 1
        self.conv1 = nn.Conv2d(1, 8, 3, padding=1)
        self.conv2 = nn.Conv2d(8, 16, 3, padding=1)
        self.conv3 = nn.Conv2d(16, 32, 3, padding=1)
        self.conv4 = nn.Conv2d(32, 64, 3, padding=1)

        self.conv5 = nn.Conv2d(64, 128, 3, padding=1)
        self.conv6 = nn.Conv2d(128, 128, 3, padding=1)

        self.conv7 = nn.Conv2d(128, 1, 3, padding=1)

        self.pool = nn.MaxPool2d((2, 2), stride=2)

        self.bn1 = nn.BatchNorm2d(8)
        self.bn2 = nn.BatchNorm2d(16)
        self.bn3 = nn.BatchNorm2d(32)
        self.bn4 = nn.BatchNorm2d(64)
        self.bn5 = nn.BatchNorm2d(128)
        self.bn6 = nn.BatchNorm2d(128)


        #### Uncomment for testing the architecture with transpose convolutions for up-sampling instead
#             self.convT1 = nn.ConvTranspose2d(64, 32, 4, stride=2, padding=1)
#             self.convT2 = nn.ConvTranspose2d(32, 16, 4, stride=2, padding=1)
#             self.convT3 = nn.ConvTranspose2d(16, 8, 4, stride=2, padding=1)
#             self.convT4 = nn.ConvTranspose2d(8, 1, 4, stride=2, padding=1)
#             self.bnT1 = nn.BatchNorm2d(32)
#             self.bnT2 = nn.BatchNorm2d(16)
#             self.bnT3 = nn.BatchNorm2d(8)


        self.relu = nn.ReLU()


    def forward(self, x):
        x = self.relu(self.bn1(self.conv1(x)))
        x = self.relu(self.bn2(self.conv2(x)))
        x = self.relu(self.bn3(self.conv3(x)))
        x = self.relu(self.bn4(self.conv4(x)))
        x = self.relu(self.bn5(self.conv5(x)))
        x = self.relu(self.bn6(self.conv6(x)))
        x = torch.sigmoid(self.conv7(x))

        #### For testing the architecture with transpose convolutions for up-sampling instead (also comment the sigmoid layer above)
#             x = self.relu(self.bnT1(self.convT1(x)))
#             x = self.relu(self.bnT2(self.convT2(x)))
#             x = self.relu(self.bnT3(self.convT3(x)))
#             x = torch.sigmoid(self.convT4(x))

        return x 
  
def run_nn(trainloader, testloader, learning_rate=10e-2):
    net = Net()

    pdb.set_trace()
    net.train()
    net = net.to(device)
    optimizer = torch.optim.Adam(net.parameters(), betas=(0.9, 0.999), eps=1e-08, weight_decay=0, amsgrad=False)
#     optimizer = optim.SGD(net.parameters(), lr=learning_rate, weight_decay=0.00001)
    criterion = nn.BCELoss(reduce=False)

    accuracies = []
    losses = []
    
    # Run the dataset through 10 times total
    numIters = 20
    for epoch in range(numIters):
        running_loss = 0.0
        running_acc = 0.0
        running_recall = 0.0
        running_precision = 0.0
        count = 0.0
        # run the main training loop
        for i, data in enumerate(trainloader, 0):
            n = data["image"].size(0)
            count += n
            input_images = data["image"]
            gt_images = data["gt_image"]
            input_images = input_images.to(device)
            gt_images = gt_images.to(device)

            optimizer.zero_grad()

            net_out = net(input_images).to(device)
            
#             pdb.set_trace()
            ### Comment below when testing deconv
            resized_output = F.interpolate(net_out.unsqueeze(0), size=(1,chunk_size,chunk_size)).squeeze()
            ### Uncomment below when testing deconv
#             resized_output = net_out.squeeze()
            fn_mask = resized_output >= .5
            fn_mask = fn_mask & (gt_images < .5)
            fn_mask = fn_mask * 1
        
            tn_mask = resized_output >= .5
            tn_mask = tn_mask & (gt_images >= .5)
            tn_mask = tn_mask * 1
            
            tp_mask = resized_output < .5
            tp_mask = tp_mask & (gt_images < .5)
            tp_mask = tp_mask * 1
            
            fp_mask = resized_output < .5
            fp_mask = fp_mask & (gt_images >= .5)
            fp_mask = fp_mask * 1
            
            n_count = torch.sum(gt_images >= .5)
            p_count = torch.sum(gt_images < .5)
            
            if n_count < 100 or p_count < 100:
              print("Skipped")
              continue
            
            fn_count = torch.sum(fn_mask > 0)
            tn_count = torch.sum(tn_mask > 0)
            tp_count = torch.sum(tp_mask > 0)
            fp_count = torch.sum(fp_mask > 0)
            
            total_size = fn_count + tn_count + tp_count + fp_count
            
            print("fn_count: " + str(fn_count) + " fp_count: " + str(fp_count) + " tn_count: " + str(tn_count) +  " tp_count: " + str(tp_count))
            
            fn_normalized = (fn_mask.float() / p_count) #if not(fn_count >= 50 else 0
            tn_normalized = (tn_mask.float() / n_count) #if not(tn_count == 0) else 0
            tp_normalized = (tp_mask.float() / p_count) #if not(tp_count == 0) else 0
            fp_normalized = (fp_mask.float() / n_count) #if fp_count >= 50 else 0
            
            
            loss_mask = 1 * fn_normalized  + 1 * tn_normalized + 1 * tp_normalized + 1 * fp_normalized
        
            loss = criterion(resized_output, gt_images)
            loss = torch.sum(loss * loss_mask.float() * total_size) / (loss_mask.numel())
            losses.append(loss)
            loss.backward()
            optimizer.step()

            # Calculate training accuracy
            predictions = (resized_output >= 0.5).float()
            accuracy = torch.sum(torch.eq(predictions, gt_images)).item() / np.prod(predictions.shape)
            accuracies.append(accuracy)
            
            # Calculate precision and recall
            pos_correct = torch.sum(((predictions+gt_images) == 2).float())
            recall = pos_correct / torch.sum(gt_images)
            precision = pos_correct / torch.sum(predictions)

            # Add to statistics
            running_loss += loss.item() * n
            running_acc += accuracy.item() * n
            running_recall += recall.item() * n
            running_precision += precision.item() * n
            print("Iter: " + str(i))
        print("Epoch: {0:}, Loss: {1:.4f}, ACC: {2:.4f}, Recall: {3:.4f}, Precision: {4:.4f}".format(
            epoch, running_loss/count, running_acc/count, running_recall/count, running_precision/count))
        # Testing loop
        torch.save(net.state_dict(), 'GTFO_'+str(epoch)+'.pt')


# def test_func(net, testloader):
#     with torch.no_grad():
#       running_loss = 0.0
#       running_acc = 0.0
#       running_recall = 0.0
#       running_precision = 0.0
#       count = 0.0
#       for i, data in enumerate(testloader, 0):
#         n = data["image"].size(0)
#         count += n
#         input_images = data["image"]
#         gt_images = data["gt_image"]
#         input_images = input_images.to(device)
#         gt_images = gt_images.to(device)

#         # Use network
#         net_out = net(input_images).to(device)
        
#         pdb.set_trace()
#         ### Comment below when testing deconv
#         resized_output = F.interpolate(net_out.unsqueeze(0), size=(1,512,512)).squeeze()      
#         ### Uncomment below when testing deconv
# #         resized_output = net_out.squeeze()
  
  
#         # Calculate loss
#         loss = criterion(resized_output, gt_images)
        
#         # Calculate test accuracy
#         predictions = (resized_output > 0.5).float()
#         accuracy = torch.sum(torch.eq(predictions, gt_images)).item() / np.prod(predictions.shape)

#         # Calculate precision and recall
#         pos_correct = torch.sum(((predictions+gt_images) == 2).float())
#         recall = pos_correct / torch.sum(gt_images)
#         precision = pos_correct / torch.sum(predictions)
        
#         # Add to statistics
#         running_loss += loss.item() * n
#         running_acc += accuracy.item() * n
#         running_recall += recall.item() * n
#         running_precision += precision.item() * n
#       print("Epoch: {0:}, Loss: {1:.4f}, ACC: {2:.4f}, Recall: {3:.4f}, Precision: {4:.4f}".format(
#           0, running_loss/count, running_acc/count, running_recall/count, running_precision/count))
      
#     # Return accuracy and loss
#     return accuracies, losses, net


def rgb2grey(rgb):
    return np.dot(rgb[...,:3], [0.299, 0.587, 0.114])

def get_wall_segmentation_from_image(net, input_image):
  device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
  WHITE = [0, 0, 0]
  chunk_dim = chunk_size
  grey_image = rgb2grey(input_image)
  image_border_right = input_image.shape[0] % chunk_dim
  image_border_bottom = input_image.shape[1] % chunk_dim
  padded_image = cv2.copyMakeBorder(input_image,0,chunk_dim - image_border_right,0,chunk_dim - image_border_bottom,cv2.BORDER_CONSTANT,value=WHITE)
  stride = chunk_dim
  predicted_image = np.zeros((padded_image.shape[0], padded_image.shape[1]))
  for i in range (0, int(padded_image.shape[0] / chunk_dim)):
    for j in range(0, int(padded_image.shape[1] / chunk_dim)):
      chunk = padded_image[chunk_dim * i:chunk_dim * (i+1), chunk_dim * j:chunk_dim * (j+1)]
      chunk = rgb2grey(chunk)
      chunk = torch.from_numpy(chunk).unsqueeze(0).unsqueeze(0).float().to(device)
      net_out = net(chunk).to(device).squeeze()
      
      ## Comment below line when testing deconv for upsampling
      resized_output = F.interpolate(net_out.unsqueeze(0).unsqueeze(0).unsqueeze(0), size=(1,chunk_size,chunk_size)).squeeze()
      ## Uncomment below line when testing deconv for upsampling
#       resized_output = net_out.squeeze()
      predicted_image[chunk_dim * i:chunk_dim * (i+1), chunk_dim * j:chunk_dim * (j+1)] = resized_output.cpu().detach().numpy()
  return predicted_image
      

def feed_image_to_net(image_data, pt_file): 
#   net = run_nn(train_dataloader, test_dataloader)
  net = Net()
  device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
  net.load_state_dict(torch.load(pt_file, map_location="cpu"))
  net.to(device)
  wall_segmentation = get_wall_segmentation_from_image(net, image_data)
  result = Image.fromarray((1 - wall_segmentation * 255).astype(np.uint8))
  result.save('output.png')
  return result
